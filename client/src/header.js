import React from 'react';
import styled from "styled-components";
import IconLogo from "./icon";
import {Icon} from "@blueprintjs/core/lib/cjs/components/icon/icon";

const TopBar = styled.div`
  display: flex;
  background: #383731;
  flex-direction: row;
  padding: 7px
  
  height: 94px;
  line-height: 1.3em;
  @media (max-width: 450px) {
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

export default () => <TopBar>
  <IconLogo />
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
