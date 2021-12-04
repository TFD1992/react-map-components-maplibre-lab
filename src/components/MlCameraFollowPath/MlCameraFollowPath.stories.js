import React from "react";

import MlCameraFollowPath from "./MlCameraFollowPath";

import mapContextDecorator from "../../decorators/MapContextDecorator";

const storyoptions = {
  title: "MapComponents/MlCameraFollowPath",
  component: MlCameraFollowPath,
  argTypes: {
    url: {},
    layer: {},
  },
  decorators: mapContextDecorator,
};
export default storyoptions;

const Template = (args) => {
  return <MlCameraFollowPath />;
};

export const ExampleConfig = Template.bind({});
ExampleConfig.parameters = {};
ExampleConfig.args = {};
