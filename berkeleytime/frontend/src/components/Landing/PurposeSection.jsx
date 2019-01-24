import React from 'react';
import FontAwesome from 'react-fontawesome';
import { LinkContainer } from 'react-router-bootstrap';

function PurposeSection({ appCards }) {
  return (
    <section className="purpose-section">
      <div className="purpose-container">
        <h2 className="purpose-title">What We Do</h2>
        <h4 className="purpose-subheading">Berkeley&apos;s definitive course catalog: designed for your needs.</h4>

        <div className="app-cards">
          {appCards.map(item => (
            <div className="card app-card">
              <FontAwesome className={`app-icon ${item.color}`} name={item.symbol} size="5x" />
              <div className="app-text">
                <h4 className="app-title">{item.title}</h4>
                <p className="app-description">{item.description}</p>
              </div>
              <LinkContainer to={item.link}>
                <a className={`app-link ${item.linkText}`}>
                  <FontAwesome name="long-arrow-right" />
                </a>
              </LinkContainer>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

PurposeSection.defaultProps = {
    appCards: [
        {
            title: "Course Catalog",
            description: "Search through 12000+ courses from the Berkeley catalog. Apply filters for requirements and majors.",
            symbol: "book",
            link: "/catalog",
            linkText: "Explore Courses",
            color: "bt-pink",
        },
        {
            title: "Grade Distributions",
            description: "See and compare grade distributions for each course and semester to make the best choice.",
            symbol: "bar-chart",
            link: "/grades",
            linkText: "Compare Grades",
            color: "bt-green",
        },
        {
            title: "Enrollment History",
            description: "View and compare real-time course enrollment trends and history.",
            symbol: "history",
            link: "/enrollment",
            linkText: "View Enrollment",
            color: "bt-blue",
        }
    ],
}

export default PurposeSection;
