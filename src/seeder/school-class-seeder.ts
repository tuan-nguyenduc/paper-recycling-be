import {AppDataSource} from "../data-source";
import School from "../entity/School";
import SchoolClass from "../entity/SchoolClass";
import {ClassStatus, SchoolStatus, SchoolType} from "../enum";
import SeedHistory from "../entity/SeedHistory";

class SchoolClassSeeder {
  private static seederName = 'SchoolClassSeeder';
  private static readonly schoolRepository = AppDataSource.getRepository(School);
  private static readonly classRepository = AppDataSource.getRepository(SchoolClass);
  private static readonly seedRepository = AppDataSource.getRepository(SeedHistory);

  public static async run() {
    try {
      const seedHistory = await this.seedRepository.findOne({
        where: {
          name: this.seederName
        }
      })
      if (seedHistory) {
        console.log('Seeder has been run');
        return;
      }
      console.log('start seeding school class');
      //create school
      const school = new School();
      school.name = 'Trung học cơ sở Gia Sàng';
      school.address = 'Gia Sàng, Thái Nguyên';
      school.phone = '0987654321';
      school.principal = 'Nguyễn Văn A';
      school.status = SchoolStatus.ACTIVE;
      school.type = SchoolType.PRIMARY;
      const createdSchool = await this.schoolRepository.save(school);
      //thscs gồm lớp 6, 7, 8, 9 mỗi khối gồm 2 lớp A, B, mỗi lớp có 30 học sinh
      for (const grade of [9, 8, 7, 6]) {
        const aClass = new SchoolClass();
        aClass.name = `${grade}A`;
        aClass.grade = grade;
        aClass.schoolId = createdSchool.id;
        aClass.status = ClassStatus.ACTIVE;
        aClass.totalStudent = 30;
        if (grade !== 9) {
          aClass.nextClassId = (await this.classRepository.findOne({
            where: {
              schoolId: createdSchool.id,
              grade: grade + 1,
              name: `${grade + 1}A`
            }
          }) as SchoolClass).id;
        }
        await this.classRepository.save(aClass);

        const bClass = new SchoolClass();
        bClass.name = `${grade}B`;
        bClass.grade = grade;
        bClass.schoolId = createdSchool.id;
        bClass.status = ClassStatus.ACTIVE;
        bClass.totalStudent = 30;
        if (grade !== 9) {
          bClass.nextClassId = (await this.classRepository.findOne({
            where: {
              schoolId: createdSchool.id,
              grade: grade + 1,
              name: `${grade + 1}B`
            }
          }) as SchoolClass).id;
        }
        await this.classRepository.save(bClass);
      }
      await this.seedRepository.save({
        name: this.seederName,
      });
      console.log("Seed school class successfully");
    } catch (error) {
      console.log("Seed school class failed: " + error)
    }
  }
}

export default SchoolClassSeeder;
