import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'rishabh.j.tripathi2903@gmail.com';

async function setAdmin() {
    try {
        console.log('Connecting to database...');

        const result = await prisma.user.updateMany({
            where: { email: ADMIN_EMAIL },
            data: { role: 'admin' }
        });

        if (result.count === 0) {
            console.log(`User with email ${ADMIN_EMAIL} not found. Please register first.`);
        } else {
            console.log(`✅ Admin role granted to ${ADMIN_EMAIL}`);
        }
    } catch (error) {
        console.error('Error setting admin:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

setAdmin();
