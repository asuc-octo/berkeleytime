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
                        <div className="founder-pic-container">
                            <img className="founder-pic" src={founder.image}/>
                        </div>
                        <div className="founder-desc">
                            <a href={founder.link}>{founder.name}</a>
                            <p>Co-Founder</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="past-contributors-others container is-fluid">
                <div className="columns is-multiline is-centered is-2">
                    {pastContributors.map((member, idx) => (
                        <div className="column is-one-fifth has-text-centered">
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
        {
            name: "Arvind Iyengar",
            link: "",
        },
        {
            name: "Christine Wang",
            link: "",
        },
        {
            name: "Emily Chen",
            link: "",
        },
        {
            name: "Eric Huynh",
            link: "",
        },
        {
            name: "Jennifer Yu",
            link: "",
        },
        {
            name: "Justin Lu",
            link: "",
        },
        {
            name: "Kelvin Leong",
            link: "",
        },
        {
            name: "Kevin Jiang",
            link: "",
        },
        {
            name: "Kimya Khoshnan",
            link: "",
        },
        {
            name: "Laura Harker",
            link: "",
        },
        {
            name: "Mihir Patil",
            link: "",
        },
        {
            name: "Niraj Amalkanti",
            link: "",
        },
        {
            name: "Parsa Attari",
            link: "",
        },
        {
            name: "Ronald Lee",
            link: "",
        },
        {
            name: "Sanchit Bareja",
            link: "",
        },
        {
            name: "Sandy Zhang",
            link: "",
        },
        {
            name: "Santhosh Subramanian",
            link: "",
        },
        {
            name: "Vaibhav Srikaran",
            link: "",
        },
    ],

};

export default PastContributors;
