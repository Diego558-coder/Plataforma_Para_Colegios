import { PrismaClient, Role, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const password = await bcrypt.hash('admin123', 10);
    const teacherPassword = await bcrypt.hash('docente123', 10);
    const studentPassword = await bcrypt.hash('estudiante123', 10);
    const school = await prisma.school.upsert({
        where: { name: 'Colegio San José' },
        update: {},
        create: {
            name: 'Colegio San José',
            city: 'Bogotá',
            address: 'Calle 123 #45-67',
            phone: '3001234567'
        }
    });
    const admin = await prisma.user.upsert({
        where: { email: 'admin@plataforma.edu.co' },
        update: {},
        create: {
            name: 'Administrador',
            email: 'admin@plataforma.edu.co',
            passwordHash: password,
            role: Role.ADMIN
        }
    });
    const teacher = await prisma.user.upsert({
        where: { email: 'docente@plataforma.edu.co' },
        update: {},
        create: {
            name: 'Prof. Juan Pérez',
            email: 'docente@plataforma.edu.co',
            passwordHash: teacherPassword,
            role: Role.TEACHER,
            schoolId: school.id
        }
    });
    const student = await prisma.user.upsert({
        where: { email: 'estudiante@plataforma.edu.co' },
        update: {},
        create: {
            name: 'María García',
            email: 'estudiante@plataforma.edu.co',
            passwordHash: studentPassword,
            role: Role.STUDENT,
            schoolId: school.id
        }
    });
    await prisma.registration.upsert({
        where: { id: 'seed-reg-1' },
        update: {},
        create: {
            id: 'seed-reg-1',
            fullName: 'María García',
            document: '1234567890',
            email: student.email,
            phone: '3001112233',
            birthdate: new Date('2010-05-15'),
            gender: 'F',
            address: 'Calle 45 #23-10',
            grade: 6,
            gradeName: '6° Bachillerato',
            guardianName: 'Ana López',
            guardianPhone: '3002223344',
            guardianEmail: 'ana.lopez@email.com',
            paymentMethod: PaymentMethod.CARD,
            amount: 150000,
            status: 'APPROVED',
            paymentStatus: 'PAID',
            schoolId: school.id,
            userId: student.id,
            approvedBy: admin.id,
            approvedAt: new Date()
        }
    });
    console.log('Seed completado');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
