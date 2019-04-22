import React, { Component } from 'react';
import { Navbar, DropdownButton } from 'react-bootstrap';

import appRoutes from '../../routes/app.jsx';

class CompareClasses extends Component{
    constructor(props){
        super(props);
        this.mobileSidebarToggle = this.mobileSidebarToggle.bind(this);
        this.state = {
            sidebarExists: false
        };
    }
    mobileSidebarToggle(e){
        if(this.state.sidebarExists === false){
            this.setState({
                sidebarExists : true
            });

        }
        e.preventDefault();
        document.documentElement.classList.toggle('nav-open');
        var node = document.createElement('div');
        node.id = 'bodyClick';
        node.onclick = function(){
            this.parentElement.removeChild(this);
            document.documentElement.classList.toggle('nav-open');
        };
        document.body.appendChild(node);
    }
    getBrand(){
        var name;
        appRoutes.map((prop,key) => {
            if(prop.collapse){
                 prop.views.map((prop,key) => {
                    if(prop.path === this.props.location.pathname){
                        name = prop.name;
                    }
                    return null;
                })
            } else {
                if(prop.redirect){
                    if(prop.path === this.props.location.pathname){
                        name = prop.name;
                    }
                }else{
                    if(prop.path === this.props.location.pathname){
                        name = prop.name;
                    }
                }
            }
            return null;
        })
        return name;
    }
    render(){
        return (
            <Row>
                <Col xs={3}>
                    <div className="card card-class"></div>
                </Col>
                <Col xs={3}></Col>
                <Col xs={2}></Col>
                <Col xs={2}></Col>
                <Col xs={2}></Col>
            </Row>
            <div className="card card-class">
                <div className="content card-class">
                    <Row>
                        <Col xs={6}>
                            <div className="classNum">
                                {this.props.classNum}
                            </div>
                        </Col>
                        <Col xs={6}>
                            <div className="classInfo">
                                {this.props.semester}
                                <br></br>
                                {this.props.faculty}
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={10}>
                        <div className="classTitle">
                            {this.props.title}
                        </div>
                        </Col>
                        <Col xs={2}>
                        <button type="button" aria-hidden="true" className="deleteBtn">&#x2715;</button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default Header;
