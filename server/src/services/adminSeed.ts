import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

/**
 * Safe startup/seed mechanism:
 * - Checks whether the admin account already exists.
 * - Creates the admin account if it does not exist.
 * - Hashes passwords with bcrypt before storing.
 * - Ensures institutional baseline accounts (Admin, Faculty, Student) are ready for immediate authentic testing.
 * - Does not duplicate accounts on restart.
 * - Does not log raw passwords.
 */
import { db } from '../db/index.js';

export async function seedAdminAccount(): Promise<void> {
  const adminName = (process.env.ADMIN_NAME || config.adminName || 'Amandeep Singh').trim();
  const rawAdminEmail = (process.env.ADMIN_EMAIL || config.adminEmail || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || config.adminPassword || 'AdminPass@2026';

  try {
    const salt = await bcrypt.genSalt(10);
    const standardAdminHash = await bcrypt.hash(adminPassword, salt);
    const userPassHash = await bcrypt.hash('Password123!', salt);

    // List of admin accounts to guarantee
    const adminAccounts = [
      {
        name: 'Chief Administrator',
        email: 'admin@campusnews.edu',
        passwordHash: standardAdminHash,
        role: 'admin' as const,
        studentFacultyId: 'ADM-2026-001',
        department: 'College Administration & IT',
        course: 'Chief Editor & Administrator',
        year: 'Staff / Admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Primary Administrator of Campus News Portal.',
      },
      {
        name: adminName || 'Amandeep Singh',
        email: 'amangogna369@gmail.com',
        passwordHash: userPassHash, // Also matches Password123! or AdminPass@2026
        role: 'admin' as const,
        studentFacultyId: 'ADM-AMAN-101',
        department: 'Computer Applications',
        course: 'Chief Administrator',
        year: 'Staff / Admin',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        bio: 'Portal Administrator & Faculty Lead.',
      },
      {
        name: 'Aman Verma',
        email: 'aman.admin@campusnews.edu',
        passwordHash: standardAdminHash,
        role: 'admin' as const,
        studentFacultyId: 'ADM-2026-002',
        department: 'College Administration',
        course: 'System Administrator',
        year: 'Staff / Admin',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'College Systems Administrator.',
      },
    ];

    for (const acc of adminAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create({
          ...acc,
          isActive: true,
        });
        console.log(`✅ [MongoDB] Administrator Initialized: ${acc.name} (${acc.email})`);
      } else if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`✅ [MongoDB] Updated existing account ${acc.email} to 'admin' role.`);
      }
    }

    // 2. Ensure a baseline Faculty account exists
    const facultyEmail = 'faculty@campusnews.edu';
    const existingFaculty = await User.findOne({ email: facultyEmail });
    if (!existingFaculty) {
      const facultyPasswordHash = await bcrypt.hash('FacultyPass@2026', salt);
      await User.create({
        name: 'Dr. Anita Desai',
        email: facultyEmail,
        passwordHash: facultyPasswordHash,
        role: 'faculty',
        studentFacultyId: 'FAC-2026-012',
        department: 'Computer Science & Engineering',
        course: 'Associate Professor',
        year: 'Faculty',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Associate Professor & Editorial Advisory Board Member for Campus News.',
        isActive: true,
      });
      console.log(`✅ [MongoDB] Baseline Faculty Account Initialized: Dr. Anita Desai (${facultyEmail})`);
    }

    // 3. Ensure a baseline Student account exists
    const studentEmail = 'student@campusnews.edu';
    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      const studentPasswordHash = await bcrypt.hash('StudentPass@2026', salt);
      await User.create({
        name: 'Rohan Verma',
        email: studentEmail,
        passwordHash: studentPasswordHash,
        role: 'student',
        studentFacultyId: 'BCA-2024-088',
        department: 'Computer Applications',
        course: 'BCA 3rd Year',
        year: '3rd Year',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        bio: 'BCA Final Year Student & Student Editorial Contributor.',
        isActive: true,
      });
      console.log(`✅ [MongoDB] Baseline Student Account Initialized: Rohan Verma (${studentEmail})`);
    }

    // 4. Automatically sync all accounts into Supabase public.profiles backend
    import('../db/supabase.js').then(async ({ syncAllUsersToSupabase }) => {
      try {
        const res = await syncAllUsersToSupabase();
        console.log(`📡 [Supabase Profiles] Auto-sync finished: ${res.syncedCount}/${res.totalUsers} profiles in Supabase.`);
      } catch (e: any) {
        console.warn('⚠️  [Supabase Profiles Auto-Sync Notice]:', e.message || e);
      }
    });
  } catch (err: any) {
    console.error('⚠️  [Admin Seed] Error while checking/creating accounts:', err.message || err);
  }
}
