import React from 'react';
import FontAwesome from 'react-fontawesome';

import leon from '../../assets/img/images/about/leon.jpg';
import will from '../../assets/img/images/about/will.jpg';
import michael from '../../assets/img/images/about/michael.jpg';
import jemma from '../../assets/img/images/about/jemma.jpg';
import richard from '../../assets/img/images/about/richard.jpg';
import anson from '../../assets/img/images/about/anson.jpg';
import chris from '../../assets/img/images/about/chris.jpg';
import eli from '../../assets/img/images/about/eli.jpg';
import evelyn from '../../assets/img/images/about/evelyn.jpg';
import grace from '../../assets/img/images/about/grace.jpg';
import sangbin from '../../assets/img/images/about/sang.jpg';
import oski from '../../assets/img/images/about/oski.jpg';
import izzie from '../../assets/img/images/about/izzie.jpg';
import mary from '../../assets/img/images/about/mary.jpg';
import chloe from '../../assets/img/images/about/chloe.jpeg';
import janet from '../../assets/img/images/about/janet.jpg';
import annie from '../../assets/img/images/about/annie.png';
import hannah from '../../assets/img/images/about/hannah.jpeg';
import sean from '../../assets/img/images/about/sean.jpeg';
import christina from '../../assets/img/images/about/christina.png';

// contributors.propTypes = {}

function CurrentContributors({ contributors }) {
  return (
    <section className="contributors">
      <div className="contributors-container">
        <div className="contributors-description">
          <h4>Meet our Team</h4>
          <p>We are a group of dedicated Berkeley students committed to making Berkeley a little smaller for everyone.</p>
        </div>

        <div className="contributor-profiles">
          {contributors.map((member) => (
            <div className="contributor-card">
              <div className="contributor-pic-container">
                <img className="contributor-pic" src={member.image} alt="" />
              </div>
              <div className="contributor-desc">
                <a href={member.site}><h5 className="contributor-name">{member.name}</h5></a>
                <p className="contributor-role">{member.role}</p>
              </div>
            </div>
          ))}
          <div className="filling-empty-space-childs" />
        </div>
      </div>
    </section>
  );
}

CurrentContributors.defaultProps = {
  contributors: [
    {
      name: 'Leon Ming',
      role: 'Chief Tech Officer',
      image: leon,
      site: 'https://leon-ming.com',
    },
    {
      name: 'Michael Li',
      role: 'Project Manager',
      image: michael,
      site: 'http://www.hantaowang.me',
    },
    {
      name: 'Will Wang',
      role: 'Advisor',
      image: will,
      site: 'http://www.hantaowang.me',
    },
    {
      name: 'Jemma Kwak',
      role: 'Design Lead',
      image: jemma,
      site: 'https://jemmakwak.github.io',
    },
    {
      name: 'Richard Liu',
      role: 'Advisor',
      image: richard,
      site: 'https://www.linkedin.com/in/richard4912',
    },
    {
      name: 'Anson Tsai',
      role: 'Backend Engineer',
      image: anson,
      site: 'https://www.linkedin.com/in/anson-tsai-83b9a312a/',
    },
    {
      name: 'Christopher Liu',
      role: 'Frontend Lead',
      image: chris,
      site: 'https://www.linkedin.com/in/christopher-d-liu/',
    },
    {
      name: 'Eli Wu',
      role: 'Backend Engineer',
      image: eli,
    },
    {
      name: 'Evelyn Li',
      role: 'Backend Engineer',
      image: evelyn,
      site: 'https://www.linkedin.com/in/yunqil/',
    },
    {
      name: 'Grace Luo',
      role: 'Frontend Engineer',
      image: grace,
      site: 'http://graceluo.me',
    },
    {
      name: 'SangBin Cho',
      role: 'Backend Engineer',
      image: sangbin,
      site: 'https://www.linkedin.com/in/sang-cho/',
    },
    {
      name: 'Sean Meng',
      role: 'Backend Engineer',
      image: sean,
      site: 'https://www.linkedin.com/in/sean-meng-berkeley/',
    },
    {
      name: 'Mary Liu',
      role: 'Backend Engineer',
      image: mary,
      site: 'https://www.linkedin.com/in/mary-liu-805068148/',
    },
    {
      name: 'Hannah Yan',
      role: 'Backend Engineer',
      image: hannah,
      site: 'https://www.linkedin.com/in/yanhannah/',
    },
    {
      name: 'Izzie Lau',
      role: 'Backend Engineer',
      image: izzie,
      site: 'https://www.linkedin.com/in/xisabellalau/',
    },
    {
      name: 'Chloe Liu',
      role: 'Frontend Engineer',
      image: chloe,
      site: 'https://www.linkedin.com/in/ruochen99/',
    },
    {
      name: 'Christina Shao',
      role: 'Frontend Engineer',
      image: christina,
      site: 'https://www.linkedin.com/in/christina-shao/',
    },
    {
      name: 'Janet Xu',
      role: 'Designer',
      image: janet,
      site: 'https://www.linkedin.com/in/janet-xu/',
    },
    {
      name: 'Annie Pan',
      role: 'Designer',
      image: annie,
      site: 'https://www.linkedin.com/in/anniexpan/',
    },
  ],
};

export default CurrentContributors;
