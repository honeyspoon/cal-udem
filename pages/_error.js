import NextErrorComponent from 'next/error';
import React from 'react';

const CustomErrorComponent = (props) => {
  return <NextErrorComponent statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  return NextErrorComponent.getInitialProps(contextData);
};

export default CustomErrorComponent;
