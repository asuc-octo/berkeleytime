
import { Leaf, LightBulbOn, EmojiTalkingHappy } from 'iconoir-react';
import Airtable from 'airtable';
import { useState, useEffect } from 'react';
import Contributors from './Contributors';


//import CurrentContributors from '../components/About/CurrentContributors';
//import PastContributors from '../components/About/PastContributors';

import AboutCarousel from './AboutCarousel';

import styles from "./About.module.scss"

export interface contributorStructure {
  name: string;
  gradYr: number;
  role: string;
  img: {
    seriousBase64: string,
    sillyBase64: string | null,
  };
  websiteURL: string;
  isAlumni: boolean
};

export default function About() {




  const [currContributors, setCurrContributors] = useState<contributorStructure[]>([]);
  const [alumniContributors, setAlumniContributors] = useState<contributorStructure[]>([]);

  useEffect(() => {
    async function fetchData() {
      await airtableDB();
    }
    fetchData()
  }, [])


  async function convertURLToBase64(url: string) {
    try {
      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');

      // Convert the image to a Blob
      const blob = await response.blob();

      // Create a FileReader to convert the Blob into a Base64 string
      const reader = new FileReader();

      // Return a promise that resolves with the Base64 string
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          // Extract the Base64 string (remove the Data URL part)
          const result = reader.result as string;
          var base64String
          if (result) {
            base64String = result.replace(/^data:.+;base64,/, '');
          }
          else {
            base64String = ''
          }
          resolve(base64String);
        };

        reader.onerror = error => {
          reject(error);
        };

        // Read the Blob as a Data URL
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      throw error;
    }
  }

  //get data from airtable
  function airtableDB() {

    Airtable.configure({
      endpointUrl: 'https://api.airtable.com',
      apiKey: 'patx4Qcyifi4UHV3H.8b72c759aea1198b30510386c507581315bd5869f454cc93847c53d9863a5928'
    });

    var base = Airtable.base('appYnXDx7R3EomuMU');

    base('General User Survey').select({
      view: "All Responses"
    }).eachPage(async function page(records: ReadonlyArray<any>, fetchNextPage) { // Mark this function as async
      // Map over records to create an array of promises
      const promises = records.map(async record => {
        const seriousPicUrl = record.get("SeriousPicture")?.[0]?.url ?? null;
        const sillyPicUrl = record.get("SillyPicture")?.[0]?.url ?? null;
        console.log(sillyPicUrl)
        const seriousBase64 = await convertURLToBase64(seriousPicUrl) as string;
        const sillyBase64 = sillyPicUrl ? await convertURLToBase64(sillyPicUrl) as string : null;
        const gradYear = record.get("GradYear") // Await the conversion

        return {
          name: record.get("Name"),
          gradYr: gradYear,
          role: record.get("Role"),
          img: {
            seriousBase64: seriousBase64,
            sillyBase64: sillyBase64,
          }, // This will be a base64 string
          websiteURL: record.get("Website"),
          isAlumni: gradYear < (new Date().getFullYear()),
        };
      });

      // Wait for all promises to resolve
      const teamMember = await Promise.all(promises);
      // Push each team member into the currentTeam array
      setCurrContributors(prevCurr => [...prevCurr, ...teamMember.filter(member => !member.isAlumni)]);
      setAlumniContributors(prevAlumni => [...prevAlumni, ...teamMember.filter(member => member.isAlumni)]);

      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }
    });

  }


  //console.log(allMembers)
  // console.log(currContributors)
  //console.log(alumniContributors)

  return (
    <div className={styles.about}>
      <div className={styles.aboutOurTeam}>
        <h1>
          About Our Team
        </h1>
        <p>
          We&apos;re a small group of student volunteers at UC Berkeley, dedicated to simplifying
          the course discovery experience. We actively build, improve and maintain Berkeleytime.
        </p>
        {/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
      </div>

      <AboutCarousel />
      <div className={styles.values}>
        <h5>Our Values</h5>
        <div className={styles.valueCol}>
          <div className={styles.value}>
            <div className={styles.valueContent}>
              <Leaf width={60} height={60} color={'#2F80ED'} />
              <h6>Growth</h6>
              <p>
                You'll grow your technical skills as you tackle real challenging design and
                engineering problems.
              </p>
            </div>
          </div>
          <div className={styles.value}>
            <div className={styles.valueContent}>
              <LightBulbOn width={60} height={60} color={'#2F80ED'} />
              <h6>Curiosity</h6>
              <p>
                We value team members that are curious about solving difficult problems and seek
                out solutions independently.
              </p>
            </div>
          </div>

          <div className={styles.value}>
            <div className={styles.valueContent}>
              <EmojiTalkingHappy width={60} height={60} color={'#2F80ED'} />
              <h6>Passion</h6>
              <p>
                Genuine commitment and dedication are critical to moving the Berkeleytime product
                forward.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Contributors
        currContributors={currContributors}
        alumniContributors={alumniContributors}
      />
      {/* <CurrentContributors />
      <PastContributors /> */}
    </div>
  );
}