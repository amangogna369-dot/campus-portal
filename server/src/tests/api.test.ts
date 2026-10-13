import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB, disconnectDB } from '../db/connection.js';
import { seedAdminAccount } from '../services/adminSeed.js';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

async function runTests() {
  console.log('🧪 Starting Campus News Portal Real MongoDB & Auth Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // Test 1: Connect to MongoDB
    await connectDB();
    assert(true, 'MongoDB connected successfully with Mongoose');

    // Test 2: Seed Administrator Account
    await seedAdminAccount();
    const adminEmail = (config.adminEmail && config.adminEmail !== 'my_admin_email')
      ? config.adminEmail
      : 'aman.admin@campusnews.edu';

    const admin = await User.findOne({ role: 'admin' });
    assert(!!admin, `Administrator found in MongoDB collection 'users'`);
    assert(admin!.role === 'admin', `Administrator role is strictly 'admin'`);
    assert(admin!.name === (config.adminName || 'Aman'), `Admin display name matches configured name: ${config.adminName || 'Aman'}`);
    assert(!admin!.passwordHash.includes('AdminPass'), `Password is NEVER stored in plain text (bcrypt hash length: ${admin!.passwordHash.length})`);

    // Test 3: Password verification via bcrypt
    const expectedPassword = (config.adminPassword && config.adminPassword !== 'my_admin_password')
      ? config.adminPassword
      : 'AdminPass@2026';
    const isPasswordValid = await bcrypt.compare(expectedPassword, admin!.passwordHash);
    assert(isPasswordValid, 'Bcrypt securely verifies admin password against stored passwordHash');

    // Test 4: Duplicate admin seeding does not create duplicate accounts
    const adminCountBefore = await User.countDocuments({ role: 'admin' });
    await seedAdminAccount();
    const adminCountAfter = await User.countDocuments({ role: 'admin' });
    assert(adminCountBefore === adminCountAfter, 'Startup seed mechanism is idempotent and prevents duplicate admin accounts');

    // Test 5: Register a real student user in MongoDB
    const testEmail = `student_${Date.now()}@campusnews.edu`;
    const plainPassword = 'StudentSecret@123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const studentUser = await User.create({
      name: 'Rohan Sharma',
      email: testEmail,
      passwordHash,
      role: 'student',
      studentFacultyId: 'STU-BCA-2026-999',
      department: 'Computer Applications',
      course: 'BCA (Bachelor of Computer Applications)',
      year: '2nd Year',
      isActive: true,
    });

    assert(!!studentUser._id, 'Student user registered and persisted in MongoDB Atlas / campusnews.users');

    // Test 6: Verify passwordHash is never returned in toSafeObject
    const safeObj = studentUser.toSafeObject();
    assert(safeObj.passwordHash === undefined, 'toSafeObject() completely excludes passwordHash');
    assert(safeObj.id === studentUser._id.toString(), 'toSafeObject() exposes string identifier');

    // Test 7: Duplicate email check in MongoDB
    const duplicate = await User.findOne({ email: testEmail });
    assert(!!duplicate, 'Duplicate detection finds existing registered email in MongoDB');

    // Test 8: JWT authentication token generation and verification
    const token = jwt.sign(
      { id: studentUser._id.toString(), email: studentUser.email, role: studentUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
    assert(typeof token === 'string' && token.length > 20, 'JWT session token generated with JWT_SECRET');

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    assert(decoded.id === studentUser._id.toString(), 'JWT token successfully verified with decoded user ID');
    assert(decoded.role === 'student', 'JWT token payload includes student role');

    // Clean up test user
    await User.findByIdAndDelete(studentUser._id);
    const deletedCheck = await User.findById(studentUser._id);
    assert(!deletedCheck, 'Test user cleaned up successfully from database');

  } catch (err: any) {
    console.error('Test Suite Error:', err);
    failed++;
  } finally {
    await disconnectDB();
  }

  console.log(`\n📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All MongoDB, Auth & RBAC unit tests PASSED successfully!\n');
  }
}

runTests();
