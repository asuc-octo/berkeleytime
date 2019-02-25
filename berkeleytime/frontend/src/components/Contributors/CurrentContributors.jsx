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
              <h4>About Us</h4>
              <p>We are a group of dedicated Berkeley students committed to making Berkeley a little united for everyone.</p>
          </div>

          <div className="contributor-profiles container is-fluid">
              <div className="columns is-centered is-multiline">
                  {contributors.map((member, idx) => (
                      <div className="column is-one-quarter has-text-centered">
                          <div className="card contributor-card">
                              <div className="contributor-pic-container">
                                  <img className="contributor-pic" src={member.image}></img>
                              </div>
                              <div className="contributor-desc">
                                  <a href={member.site}><h5 className="contributor-name">{member.name}</h5></a>
                                  <p className="contributor-role">{member.role}</p>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <div className="card contributor-join-card">
              <h4>Join Our Team!</h4>
              <p>We're looking for great talent, so don't hesitate to reach out.</p>
          </div>
      </div>
  </section>
);
}

CurrentContributors.defaultProps = {
  contributors: [
    { name: "Leon Ming",
      role: "CTO",
      image: leon,
    }, 
    { name: "Will Wang",
      role: "Product Manager",
      image: will,
      site: "http://www.hantaowang.me",
    }, 
    { name: "Michael Li",
      role: "Frontend Engineering Lead",
      image: michael,
      site: "https://www.linkedin.com/in/michael-li1/",
    }, 
    { name: "Jemma Kwak",
      role: "Design Lead",
      image: jemma,
      site: "https://jemmakwak.github.io",
    }, 
    { name: "Kate Xu",
      role: "Frontend Engineering Lead",
      image: kate,
      site: "https://www.linkedin.com/in/kate-shijie-xu-666b57110/",
    }, 
    { name: "Richard Liu",
      role: "ML / Algs Lead",
      image: richard,
      site: "https://www.linkedin.com/in/richard4912",
    }, 
    { name: "Alex Bondarenko",
      role: "Backend Engineering",
      image: oski,
    }, 
    { name: "Anson Tsai",
      role: "Backend Engineering",
      image: anson,
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
    }, 
    { name: "SangBin Cho",
      role: "Backend Engineering",
      image: sangbin,
    },
  ],
};

export default CurrentContributors;
