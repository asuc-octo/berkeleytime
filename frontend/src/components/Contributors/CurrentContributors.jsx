import React from 'react';
import FontAwesome from 'react-fontawesome';

import leon from "../../assets/img/images/about/leon.png";
import will from "../../assets/img/images/about/will.png";
import michael from "../../assets/img/images/about/michael.jpg";
import jemma from "../../assets/img/images/about/jemma.png";
import kate from "../../assets/img/images/about/kate.jpg";
import richard from "../../assets/img/images/about/richard.jpg";
import anson from "../../assets/img/images/about/anson.png";
import chris from "../../assets/img/images/about/chris.jpg";
import eli from "../../assets/img/images/about/eli.jpg";
import evelyn from "../../assets/img/images/about/evelyn.jpg";
import grace from "../../assets/img/images/about/grace.jpg";
import sangbin from "../../assets/img/images/about/sang.jpg";
import oski from "../../assets/img/images/about/oski.jpg";

function CurrentContributors({ contributors }) {
  return (
    <section className="contributors">
      <div className="contributors-container">
          <div className="contributors-description">
              <h4>Meet our Team</h4>
              <p>We are a group of dedicated Berkeley students committed to making Berkeley a little smaller for everyone.</p>
          </div>

          <div className="contributor-profiles">
                  {contributors.map((member, idx) => (
                      <div className="contributor-card">
                        <div className="contributor-pic-container">
                          <img className="contributor-pic" src={member.image}></img>
                        </div>
                        <div className="contributor-desc">
                          <a href={member.site}><h5 className="contributor-name">{member.name}</h5></a>
                          <p className="contributor-role">{member.role}</p>
                        </div>
                      </div>
                  ))}
          </div>
      </div>
  </section>
);
}

CurrentContributors.defaultProps = {
  contributors: [
    { name: "Leon Ming",
      role: "Chief Tech Officer",
      image: leon,
      site: "https://leon-ming.com",
    }, 
    { name: "Will Wang",
      role: "Project Manager",
      image: will,
      site: "http://www.hantaowang.me",
    }, 
    { name: "Jemma Kwak",
      role: "Design Lead",
      image: jemma,
      site: "https://jemmakwak.github.io",
    }, 
    { name: "Kate Xu",
      role: "Frontend Lead",
      image: kate,
      site: "https://www.linkedin.com/in/kate-shijie-xu-666b57110/",
    },
    { name: "Michael Li",
      role: "Frontend Lead",
      image: michael,
      site: "http://www.michaelli.me",
    },
    { name: "Richard Liu",
      role: "ML / Algs Lead",
      image: richard,
      site: "https://www.linkedin.com/in/richard4912",
    },
    { name: "Anson Tsai",
      role: "Backend Engineering",
      image: anson,
      site: "https://www.linkedin.com/in/anson-tsai-83b9a312a/",
    }, 
    { name: "Christopher Liu",
      role: "Frontend Engineering",
      image: chris,
      site: "https://www.linkedin.com/in/christopher-d-liu/",
    }, 
    { name: "Eli Wu",
      role: "ML / Alg",
      image: eli,
    }, 
    { name: "Evelyn Li",
      role: "Backend Engineering",
      image: evelyn,
      site: "https://www.linkedin.com/in/yunqil/",
    }, 
    { name: "Grace Luo",
      role: "Frontend Engineering",
      image: grace,
      site: "http://graceluo.me",
    }, 
    { name: "Sangbin Cho",
      role: "Backend Engineering",
      image: sangbin,
      site: "https://www.linkedin.com/in/sang-cho/",
    },
  ],
};

export default CurrentContributors;