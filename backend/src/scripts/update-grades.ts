import mongooseLoader from '../bootstrap/loaders/mongoose';
import * as Fs from 'fs';
import { GradeModel } from '../models/grade';

const resourcesPath = "/backend/src/resources/grades/raw"

const getAllGradeFiles = async () => {
    return Fs.readdirSync(resourcesPath)
}

const fileToMongo = async (file : string) => {
    const matches = /(fall|spring|summer)_([0-9]{4})/.exec(file)

    if (matches == null) throw new Error("Invalid files found")

    const semester = matches[1]
    const year = parseInt(matches[2])

    const headerMap : Map<string, number> = new Map()
    const objects:any[] = []
    
    const data = Fs.readFileSync(`${resourcesPath}/${file}`)

    console.log("Starting: " + file, data.length)
    let lines = data.toString().split("\n")
    const header = lines[0].split(",")
    lines = lines.slice(1)

    header.forEach((name, index) => {
        headerMap.set(name, index)
    })
    lines.forEach((line) => {
        try {
            const values = line.split(",")
            const obj:any = {
                CourseControlNbr: parseInt(values[headerMap.get("Course Control Nbr")!]),
                CourseNumber: values[headerMap.get("Course Number")!],
                CourseSubjectShortNm: values[headerMap.get("Course Subject Short Nm")!],
                CourseTitleName: values[headerMap.get("Course Title Nm")!],
                EnrollmentCnt: parseInt(values[headerMap.get("EnrollmentCnt")!]),
                GradeNm: values[headerMap.get("Grade Nm")!],
                GradeSortNbr: values[headerMap.get("Grade Sort Nbr")!],
                GradeSubtypeDesc: values[headerMap.get("Grade Subtype Desc")!],
                GradeTypeDesc: values[headerMap.get("Grade Type Desc")!],
                InstructorName: values[headerMap.get("Instructor Name")!].split("; "),
                SectionNbr: values[headerMap.get("Section Nbr")!],
                term: {
                    semester: semester,
                    year: year
                }
            }
            Object.keys(obj).forEach((k) => obj[k] == null || obj[k] == "" || Number.isNaN(obj[k]) && delete obj[k]);
            objects.push(obj)
        } catch(err) {
            console.log(file, err, line)
        }
    })

    console.log(`Processing for ${file} complete, ${objects.length} documents to be added`)
    await GradeModel.insertMany(objects)

    console.log(`Successfully saved ${file}`)
}

(async () => {
    try {

        await mongooseLoader();

        await GradeModel.deleteMany({})

        const files = await getAllGradeFiles()
        for(const file of files) {
            await fileToMongo(file)
        }

        console.log((await GradeModel.find()).length)

        console.log("SUCCESS")

    } catch (err) {
        await GradeModel.deleteMany({})
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
})();