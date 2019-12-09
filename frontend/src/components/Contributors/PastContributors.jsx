import React from 'react';

import yuxin from '../../assets/img/images/about/yuxin.jpg';
import noah from '../../assets/img/images/about/noah.jpg';
import ashwin from '../../assets/img/images/about/ashwin.jpg';

function PastContributors({ founders, pastContributors }) {
  return (
    <section className="past-contributors">
      <div className="past-contributors-content">
        <h4>Individuals that made it happen</h4>
        <div className="past-contributors-founders">
          {founders.map((founder) => (
            <div className="founder-card">
              <div className="founder-desc">
                <a href={founder.link}>{founder.name}</a>
                <p>Co-Founder</p>
              </div>
            </div>
          ))}
        </div>
        <div className="past-contributors-others">
          <div className="row">
            {pastContributors.map((member) => (
              <div className="column" style={{ height: 45, width: 170 }}>
                {member.site ? <a href={member.site}>{member.name}</a>
                  : <span>{member.name}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="graphic-contributors">
                Landing page artwork by <a href="http://victorialynwu.design">Victoria Wu</a>
          <br />
                Detective bear artwork by <a href="http://behance.net/lauralim125">Laura Lim</a>
        </div>
      </div>
    </section>
  );
}

PastContributors.defaultProps = {
  founders: [
    {
      name: 'Yuxin Zhu',
      image: yuxin,
      link: 'http://yuxinzhu.com/#/',
    },
    {
      name: 'Noah Gilmore',
      image: noah,
      link: 'https://noahgilmore.com',
    },
    {
      name: 'Ashwin Iyengar',
      image: ashwin,
      link: 'https://www.lsgnt-cdt.ac.uk/students/year/2017',
    },
  ],
  pastContributors: [
    {
      name: 'Alan Rosenthal',
      site: 'https://www.linkedin.com/in/alan-rosenthal-37767614a/',
    },
    {
      name: 'Christine Wang',
      site: 'https://www.linkedin.com/in/cwang395/',
    },
    {
      name: 'Emily Chen',
      site: null,
    },
    {
      name: 'Kate Xu',
      site: 'https://www.linkedin.com/in/kate-shijie-xu-666b57110/',
    },
    {
      name: 'Eric Huynh',
      site: 'http://erichuynhing.com',
    },
    {
      name: 'Flora Xue',
      site: 'https://www.linkedin.com/in/flora-zhenruo-xue/',
    },
    {
      name: 'Jennifer Yu',
      site: null,
    },
    {
      name: 'Justin Lu',
      site: null,
    },
    {
      name: 'Katharine Jiang',
      site: 'http://katharinejiang.com',
    },
    {
      name: 'Kelvin Leong',
      site: 'https://www.linkedin.com/in/kelvinjleong/',
    },
    {
      name: 'Kevin Jiang',
      site: 'https://github.com/kevjiangba',
    },
    {
      name: 'Kimya Khoshnan',
      site: null,
    },
    {
      name: 'Laura Harker',
      site: null,
    },
    {
      name: 'Mihir Patil',
      site: null,
    },
    {
      name: 'Niraj Amalkanti',
      site: null,
    },
    {
      name: 'Parsa Attari',
      site: null,
    },
    {
      name: 'Ronald Lee',
      site: null,
    },
    {
      name: 'Sanchit Bareja',
      site: null,
    },
    {
      name: 'Sandy Zhang',
      site: null,
    },
    {
      name: 'Scott Lee',
      site: 'http://scottjlee.github.io',
    },
    {
      name: 'Tony Situ',
      site: 'https://www.linkedin.com/in/c2tonyc2/',
    },
    {
      name: 'Vaibhav Srikaran',
      site: 'https://www.linkedin.com/in/vsrikaran/',
    },
  ],

};

export default PastContributors;
