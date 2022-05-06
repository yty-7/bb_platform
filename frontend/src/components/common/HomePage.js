// import React, { useState } from 'react';
// import classNames from 'classnames';
// import { SectionProps } from '../../utils/SectionProps';
// import ButtonGroup from '../elements/ButtonGroup';
// import Button from '../elements/Button';
// import Image from '../elements/Image';
// import Modal from '../elements/Modal';

// const propTypes = {
//   ...SectionProps.types
// }

// const defaultProps = {
//   ...SectionProps.defaults
// }

// const Hero = ({
//   className,
//   topOuterDivider,
//   bottomOuterDivider,
//   topDivider,
//   bottomDivider,
//   hasBgColor,
//   invertColor,
//   ...props
// }) => {

//   const [videoModalActive, setVideomodalactive] = useState(false);

//   const openModal = (e) => {
//     e.preventDefault();
//     setVideomodalactive(true);
//   }

//   const closeModal = (e) => {
//     e.preventDefault();
//     setVideomodalactive(false);
//   }   

//   const outerClasses = classNames(
//     'hero section center-content',
//     topOuterDivider && 'has-top-divider',
//     bottomOuterDivider && 'has-bottom-divider',
//     hasBgColor && 'has-bg-color',
//     invertColor && 'invert-color',
//     className
//   );

//   const innerClasses = classNames(
//     'hero-inner section-inner',
//     topDivider && 'has-top-divider',
//     bottomDivider && 'has-bottom-divider'
//   );

//   return (
//     <section
//       {...props}
//       className={outerClasses}
//     >
//       <div className="container-sm">
//         <div className={innerClasses}>
//           <div className="hero-content">
//             <h1 className="mt-0 mb-16 reveal-from-bottom" data-reveal-delay="200">
//               Cloud-based Information System For <span className="text-color-primary">Digital Agriculture</span>
//             </h1>
//             <div className="container-xs">
//               <p className="m-0 mb-32 reveal-from-bottom" data-reveal-delay="400">
//                 A system that can manage, curate, analyze, and visualize image datasets for high throughput plant phenotyping
//               </p>
              
//             </div>
//           </div>
//           <div className="hero-figure reveal-from-bottom illustration-element-01" data-reveal-value="20px" data-reveal-delay="800">
//             <a>
//               <Image
//                 className="has-shadow"
//                 src={require('./../../assets/images/grapes-g046c6f297_1920.jpg')}
//                 alt="Hero"
//                 width={12000}
//                 height={200} />
//             </a>
//           </div>
          
//           <Modal
//             id="video-modal"
//             show={videoModalActive}
//             handleClose={closeModal}
//             video="https://player.vimeo.com/video/174002812"
//             videoTag="iframe" />
//         </div>
//       </div>
//     </section>
//   );
// }

// Hero.propTypes = propTypes;
// Hero.defaultProps = defaultProps;

// export default Hero;

import React from "react";
import { connect } from "react-redux";
import { Route, Redirect, Link } from "react-router-dom";

const PrivateRoute = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (auth.isLoading) {
        return <h2>Loading...</h2>;
      } else if (!auth.isAuthenticated) {
        return <Redirect to="/login" />;   
      } else {
        return <Component {...props} />;
      }
    }}
  />
);

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);

export const LinkTag = (props) => {
  return (
    <Link to={props.to} style={{ color: "steelblue", textDecoration: "none" }}>   
      {props.children}
    </Link>
  );
};
//所有linkTag是这样
