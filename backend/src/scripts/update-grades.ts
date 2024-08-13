import mongooseLoader from '../bootstrap/loaders/mongoose';
import * as Fs from 'fs';
import { GradeModel } from '../models/grade';

const resourcesPath = "/backend/src/resources/grades/raw"

const getAllGradeFiles = async () => {
    return Fs.readdirSync(resourcesPath)
}

const capitalizeFirstLetter = (s : string) : string => {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

let accessed = false;

const getOrDefault = (values : string[], m : Map<string, number>, key : string) : string | null => {
    if (!m.has(key)) return null;
    const ind = m.get(key)
    if (ind === undefined) return null;
    return values[m.get(key)!];
}

const fileToMongo = async (file : string) => {
    const matches = /(fall|spring|summer)_([0-9]{4})/.exec(file)

    if (matches == null) throw new Error("Invalid files found")

    const semester = matches[1]
    const year = parseInt(matches[2])

    const headerMap : Map<string, number> = new Map()
    const objects:any[] = []
    
    const data = Fs.readFileSync(`${resourcesPath}/${file}`)

    console.log("Starting: " + file, "Lines: " + data.length)
    let lines = data.toString().split("\n")
    const header = lines[0].split(",")
    lines = lines.slice(1)

    header.forEach((name, index) => {
        headerMap.set(name.replace(/^[0-9\s]*|[+*\r\n]/g, ""), index)
    })
    lines.forEach((line) => {
        try {
            if (!line) return
            const values = line.split(",")
            const obj:any = {
                CourseControlNbr: parseInt(getOrDefault(values, headerMap, "Course Control Nbr") ?? ""),
                CourseNumber: getOrDefault(values, headerMap, "Course Number"),
                CourseSubjectShortNm: getOrDefault(values, headerMap, "Course Subject Short Nm"),
                CourseTitleName: getOrDefault(values, headerMap, "Course Title Nm"),
                EnrollmentCnt: parseInt(getOrDefault(values, headerMap, "Enrollment Cnt") ?? ""),
                GradeNm: getOrDefault(values, headerMap, "Grade Nm"),
                GradeSortNbr: getOrDefault(values, headerMap, "Grade Sort Nbr"),
                GradeSubtypeDesc: getOrDefault(values, headerMap, "Grade Subtype Desc"),
                GradeTypeDesc: getOrDefault(values, headerMap, "Grade Type Desc"),
                InstructorName: (getOrDefault(values, headerMap, "Instructor Name") ?? "").split("; "),
                SectionNbr: getOrDefault(values, headerMap, "Section Nbr"), 
                term: {
                    semester: capitalizeFirstLetter(semester),
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

        console.log(`Loaded ${(await GradeModel.find()).length} entries`)

        console.log("SUCCESS")

    } catch (err) {
        await GradeModel.deleteMany({})
        console.error(err);
        process.exit(1);
    }

    process.exit(0);
})();