import React, { useContext } from "react";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import { withStyles } from "@material-ui/core/styles";
import Context from "../context";
import CreatePin from "./Pin/CreatePin";
import NoContent from "./Pin/NoContent";

import { Paper } from "@material-ui/core";
import PinContent from "./Pin/PinContent";

const Blog = ({ classes }) => {
   const mobileSize = useMediaQuery("(max-width: 650px)");
   const { state } = useContext(Context);
   const { draft, currentPin } = state;
   let BlogContent;
   if (!draft && !currentPin) {
      //no content
      BlogContent = NoContent;
   } else if (draft) {
      // create pin component
      BlogContent = CreatePin;
   } else if (currentPin) {
      BlogContent = PinContent;
   }
   return (
      <Paper className={mobileSize ? classes.rootMobile : classes.root}>
         <BlogContent />
      </Paper>
   );
};

const styles = {
   root: {
      minWidth: 350,
      maxWidth: 400,
      maxHeight: "calc(100vh - 64px)",
      overflowY: "scroll",
      display: "flex",
      justifyContent: "center"
   },
   rootMobile: {
      maxWidth: "100%",
      maxHeight: 300,
      overflowX: "hidden",
      overflowY: "scroll"
   }
};

export default withStyles(styles)(Blog);
