import * as child from 'child_process';
import mongooseLoader from '../bootstrap/loaders/mongoose';
import { SemesterType, SemesterModel } from '../models/semester';
import { dateToTerm } from '../utils/term';
import { config } from '../config';

const COLLECTION_RENAME_MAP:any = {
    "sis_class": "class",
    "sis_course": "course",
    "sis_class_section": "sections"
}

const termOrder = ["Spring", "Summer", "Fall"]

const FIRST_SEMESTER = {term: "Spring", year: 2012, active: false}

const today = new Date();
let current_semester = {term: dateToTerm(today), year: today.getFullYear(), active: true}

const retrieveSeed = async () => {

    const curl = child.spawn("curl", ["-O", "https://storage.googleapis.com/berkeleytime/public/mdb.archive"])
    await new Promise((resolve) => {
        curl.stdout.on("data", (data) => {
            console.log(data.toString())
        })
        curl.on("close", resolve)
    })

    const restore = child.spawn("mongorestore", ["--uri", config.mongoDB.uri, "--drop", "--gzip", "--archive=mdb.archive"])
    await new Promise((resolve) => {
        restore.stderr.on("data", (data) => {
            console.log(data.toString())
        })
        restore.on("close", resolve)
    })

}

const fixSISCollections = async () => {
    for (var original in COLLECTION_RENAME_MAP) {
        const newName = COLLECTION_RENAME_MAP[original]
        const dump = child.spawn("mongodump", ["--uri", config.mongoDB.uri, "-d", "bt", "-c", original])
        await new Promise((resolve) => {
            dump.stderr.on("data", (data) => {
                console.log(data.toString())
            })
            dump.on("close", resolve)
        })
        const restore = child.spawn("mongorestore", ["--uri", config.mongoDB.uri, "--drop", "-d", "bt", "-c", newName, `dump/bt/${original}.bson`])
        await new Promise((resolve) => {
            restore.stderr.on("data", (data) => {
                console.log(data.toString())
            })
            restore.on("close", resolve)
        })
    }
}

const nextSemester = (currentSemester : SemesterType) : SemesterType => {
    const termIndex = termOrder.indexOf(currentSemester.term)
    const finalTerm = (termIndex == termOrder.length - 1)
    return {
        term: (finalTerm) ? termOrder[0] : termOrder[termIndex + 1],
        year: (finalTerm) ? currentSemester.year + 1 : currentSemester.year,
        active: false
    }
}

const createSemesters = async (firstSemester : SemesterType, currentSemester : SemesterType) => {
    await SemesterModel.deleteMany({})
    const semesters = []
    for (let semester = firstSemester; 
            semester.year != currentSemester.year || semester.term != currentSemester.term;
                semester = nextSemester(semester)) {
        semesters.push(semester)
    }
    semesters.push(currentSemester)
    await SemesterModel.insertMany(semesters)
    const numLoaded = await SemesterModel.count({})
    if (numLoaded != semesters.length) {
        throw Error(`Error while loading semesters: Got ${numLoaded}, expected ${semesters.length}`)
    }
    console.log(`Total number of semesters: ${numLoaded}`)
}

const runUpdateCatalog = async () => {
    const process = child.spawn("npm", ["run", "update:catalog"])
    await new Promise((resolve) => {
        process.stdout.on("data", (data) => {
            console.log(data.toString())
        })
        process.on("close", resolve)
    })
}


(async () => {

    // pre-reqs: Make sure .env is correctly setup

    try {

        await mongooseLoader()

        console.log("\n===== RETRIEVING MONGODUMP ARCHIVE =====")
        //await retrieveSeed()

        console.log("\n===== COPY SIS_* COLLECTION DATA =====")
        await fixSISCollections()

        // allow arguments --term=TERM and --year=YEAR to set current semester
        process.argv.forEach((arg) => {
            if (arg.substring(0, 2) == "--") {
                arg = arg.substring(2)
                const equalSign = arg.indexOf("=")
                if (equalSign == -1) throw new Error("Script arguments incorrectly formatted")
                const key = arg.substring(0, equalSign)
                const val = arg.substring(equalSign + 1)
                switch (key) {
                    case "term":
                        current_semester.term = val
                    case "year":
                        current_semester.year = +val
                }
            }
        })

        console.log("\n===== CREATING SEMESTERS =====")
        await createSemesters(
            FIRST_SEMESTER,
            current_semester
        )

        console.log("\n===== RUN UPDATE CATALOG SCRIPT =====")
        await runUpdateCatalog()

    } catch (err) {
        console.error(err)
        process.exit(1)
    }

    process.exit(0)
})()