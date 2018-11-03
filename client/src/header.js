import React from 'react';
import styled from "styled-components";
import IconLogo from "./icon";
import {Icon} from "@blueprintjs/core/lib/cjs/components/icon/icon";
import {branch, compose, renderNothing, withState} from "recompose";

const TopBar = styled.div`
  display: flex;
  background: #383731;
  flex-direction: row;
  padding: 7px
  
  height: 94px;
  line-height: 1.3em;
  @media (max-width: 450px) {
    flex-direction: column;
    height: auto;
    line-height: 1.5em;
  }
`;

const Description = styled.div`
  flex: 1
  display: flex;
  flex-direction: column;
  color: #FFFFFF

  flex-wrap: wrap;
`;

const Title = styled.div`
  font-weight: bold;
  margin-left: 15px;
  color: #FF9000
`;

const Bold = styled.span`
  font-weight: bold;
`;

const Text = styled.div`
  margin-left: 15px;
`;

const Link = styled.div`
  margin-left: 15px;
    
  text-decoration: None;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

const githubLink = "https://github.com/kirill578/js-api-bin";


const LogoContainer = styled.div`
  align-self: flex-start; 
  @media (max-width: 450px) {
    align-self: center; 
  }
`;

const RightCornor = styled(Icon)`
  position: absolute;
  right: 5px;
  top: 5px;
`;

const RawLogger = ({setShow}) => <TopBar>
  <RightCornor icon="small-cross" iconSize={20} color={'#FFF'} onClick={() => setShow(false)}/>
  <LogoContainer>
    <IconLogo />
  </LogoContainer>
  <Description>
    <Title>Build basic API in seconds</Title>
    <Text>Click <Bold>save</Bold>, and hit the URLs in the console</Text>
    <Text>Persist data with <Bold>db['name'] = bob</Bold></Text>
    <Text>Log via <Bold>console.log('Hello world')</Bold></Text>
    <Text>Access <Bold>?name=bob</Bold> as <Bold>params.name</Bold></Text>
    <Text>Request <Bold>body</Bold> is parsed as JSON object</Text>
    <Text>Return value will be encoded as JSON</Text>
    <Link onClick={() => window.open(githubLink, "_blank")}><Bold>Source</Bold> is available on <Icon icon="git-branch" color="#FFFFFF" /> GitHub</Link>
  </Description>
</TopBar>;

export default compose(
  withState('show', 'setShow', true),
  branch(({show}) => !show, renderNothing)
)(RawLogger);
