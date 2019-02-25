import React from 'react';

import yuxin from '../../assets/img/images/about/yuxin.jpg';
import noah from '../../assets/img/images/about/noah.jpg';

function PastContributors({ founders, pastContributors }) {
  return (
    <section className="past-contributors">
        <div className="past-contributors-content">
            <h4>Individuals that made it happen</h4>
            <div className="past-contributors-founders">
                {founders.map((founder, idx) => (
                    <div className="founder-card">
                        <div className="founder-desc">
                            <a href={founder.link}>{founder.name}</a>
                            <p>Co-Founder</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="past-contributors-others container is-fluid">
                <div className="columns is-multiline is-centered is-gapless">
                    {pastContributors.map((member, idx) => (
                        <div className="column is-one-fifth has-text-centered" style={{height: 45, width: 170}}>
                            <a href={member.link}>{member.name}</a>
                        </div>
                ))} 
                    </div>
            </div>
        </div>
    </section>
);
}

PastContributors.defaultProps = {
    founders: [
        {
            name: "Yuxin Zhu",
            image: yuxin,
            link: "",
        },
        {
            name: "Noah Gilmore",
            image: noah,
            link: "",
        }
    ],
    pastContributors: [
        { name: "Alan Rosenthal",
        site: null,
        }, 
        { name: "Arvind Iyengar",
          site: "https://www.linkedin.com/in/iyengararvind/",
        }, 
        { name: "Christine Wang",
          site: "https://www.linkedin.com/in/cwang395/",
        }, 
        { name: "Emily Chen",
          site: null,
        }, 
        { name: "Eric Huynh",
          site: "http://erichuynhing.com",
        }, 
        { name: "Flora Xue",
          site: "https://www.linkedin.com/in/flora-zhenruo-xue/",
        }, 
        { name: "Jennifer Yu",
          site: null,
        }, 
        { name: "Justin Lu",
          site: null,
        }, 
        { name: "Katharine Jiang",
          site: "http://katharinejiang.com",
        }, 
        { name: "Kelvin Leong",
          site: "https://www.linkedin.com/in/kelvinjleong/",
        }, 
        { name: "Kevin Jiang",
          site: "https://github.com/kevjiangba",
        }, 
        { name: "Kimya Khoshnan",
          site: null,
        }, 
        { name: "Laura Harker",
          site: null,
        }, 
        { name: "Mihir Patil",
          site: null,
        }, 
        { name: "Niraj Amalkanti",
          site: null,
        }, 
        { name: "Parsa Attari",
          site: null,
        }, 
        { name: "Ronald Lee",
          site: null,
        }, 
        { name: "Sanchit Bareja",
          site: null,
        }, 
        { name: "Sandy Zhang",
          site: null,
        }, 
        { name: "Scott Lee",
          site: "http://scottjlee.github.io",
        }, 
        { name: "Tony Situ",
          site: "https://www.linkedin.com/in/c2tonyc2/",
        }, 
        { name: "Vaibhav Srikaran",
          site: "https://www.linkedin.com/in/vsrikaran/",
        }
    ],

};

export default PastContributors;
