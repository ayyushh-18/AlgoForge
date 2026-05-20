import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const genericTestCases = [
    {
        input: '1 2',
        expectedOutput: '3',
        isHidden: false
    },
    {
        input: '5 7',
        expectedOutput: '12',
        isHidden: false
    },
    {
        input: '10 20',
        expectedOutput: '30',
        isHidden: true
    }
];

async function addTestCases() {
    try {
        console.log('Fetching all problems...');
        const problems = await prisma.problem.findMany();
        
        console.log(`Updating ${problems.length} problems with test cases...`);
        for (const problem of problems) {
            await prisma.problem.update({
                where: { id: problem.id },
                data: {
                    testCases: genericTestCases
                }
            });
        }
        
        console.log('Successfully added test cases to all problems.');
    } catch (error) {
        console.error('Error adding test cases:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addTestCases();
