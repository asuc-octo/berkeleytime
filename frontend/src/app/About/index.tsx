
//import { Row, Col } from 'react-bootstrap';
import { Leaf, LightBulbOn, EmojiTalkingHappy } from 'iconoir-react';
import Airtable from 'airtable';

import { useState, useEffect } from 'react';


//import { H3, P } from 'bt/custom';

//import CurrentContributors from '../components/About/CurrentContributors';
//import PastContributors from '../components/About/PastContributors';

import AboutCarousel from './AboutCarousel';

import styles from "./About.module.scss"

export default function About() {

  const currentTeam: { name: string; date: string, pictureBase64: any }[] = [];

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
        const pictureUrl = record.get("Picture")[0].url;
        const pictureBase64 = await convertURLToBase64(pictureUrl); // Await the conversion
        return {
          name: record.get("Name"),
          date: record.get("Date"),
          pictureBase64 // This will be a base64 string
        };
      });

      // Wait for all promises to resolve
      const teamMembers = await Promise.all(promises);
      // Push each team member into the currentTeam array
      teamMembers.forEach(member => currentTeam.push(member));

      fetchNextPage();
    }, function done(err) {
      if (err) { console.error(err); return; }
    });

  }

  console.log(currentTeam)

  return (
    <div className={styles.about}>
      <div className={styles.aboutOurTeam}>
        <h1 className="mb-2 bold">
          About Our Team
        </h1>
        <p className="mb-3">
          We&apos;re a small group of student volunteers at UC Berkeley, dedicated to simplifying
          the course discovery experience. We actively build, improve and maintain Berkeleytime.
        </p>
        {/* <Button variant="inverted" link_to="/apply">Join Our Team</Button> */}
      </div>
      {/* <AboutCarousel /> */}
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
      {/* <CurrentContributors />
      <PastContributors /> */}
    </div>
  );
}