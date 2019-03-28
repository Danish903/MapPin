import React, { useState, useContext } from "react";
import axios from "axios";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import Context from "../../context";
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";
import { useClient } from "../../client";

const CreatePin = ({ classes }) => {
   const client = useClient();
   const mobileSize = useMediaQuery("(max-width: 650px)");
   const { state, dispatch } = useContext(Context);
   const [title, setTitle] = useState("");
   const [image, setImage] = useState("");
   const [content, setContent] = useState("");
   const [submitting, setSubmitting] = useState(false);

   const handleImageUpload = async () => {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "geopins");
      data.append("cloud_name", "dluo0wvst");
      const res = await axios.post(
         "https://api.cloudinary.com/v1_1/dluo0wvst/image/upload",
         data
      );
      return res.data.url;
   };
   const handleSubmit = async e => {
      e.preventDefault();
      try {
         setSubmitting(true);
         const url = await handleImageUpload();
         const { draft } = state;
         const { latitude, longitude } = draft;
         const variables = { title, image: url, content, latitude, longitude };
         await client.request(CREATE_PIN_MUTATION, variables);
         handleDeleteDraft();
      } catch (error) {
         setSubmitting(false);
         console.error("Error creating pin ", error);
      }
   };

   const handleDeleteDraft = () => {
      setTitle("");
      setImage("");
      setContent("");
      dispatch({ type: "DELETE_DRAFT" });
   };
   return (
      <form className={classes.form}>
         <Typography
            className={classes.alignCenter}
            component="h2"
            variant="h4"
            color="secondary"
         >
            <LandscapeIcon className={classes.iconLarge} /> Pin Location
         </Typography>
         <div>
            <TextField
               name="title"
               label="title"
               placeholder="Insert pin title"
               onChange={e => setTitle(e.target.value)}
            />
            <input
               accep="image/*"
               id="image"
               type="file"
               className={classes.input}
               onChange={e => setImage(e.target.files[0])}
            />
            <label htmlFor="image">
               <Button
                  style={{ color: !!image && "green" }}
                  component="span"
                  size="small"
                  className={classes.button}
               >
                  <AddAPhotoIcon />
               </Button>
            </label>
         </div>
         <div className={classes.contentField}>
            <TextField
               name="content"
               label="Content"
               multiline
               rows={mobileSize ? "3" : "6"}
               margin="normal"
               fullWidth
               variant="outlined"
               placeholder="Add some contents..."
               onChange={e => setContent(e.target.value)}
            />
         </div>
         <div>
            <Button
               className={classes.button}
               variant="contained"
               color="primary"
               onClick={handleDeleteDraft}
            >
               <ClearIcon className={classes.leftIcon} />
               Discard
            </Button>
            <Button
               type="submit"
               className={classes.button}
               variant="contained"
               color="secondary"
               disabled={
                  !title.trim() || !image || !content.trim() || submitting
               }
               onClick={handleSubmit}
            >
               Save
               <SaveIcon className={classes.RightIcon} />
            </Button>
         </div>
      </form>
   );
};

const styles = theme => ({
   form: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      paddingBottom: theme.spacing.unit
   },
   contentField: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
      width: "95%"
   },
   input: {
      display: "none"
   },
   alignCenter: {
      display: "flex",
      alignItems: "center"
   },
   iconLarge: {
      fontSize: 40,
      marginRight: theme.spacing.unit
   },
   leftIcon: {
      fontSize: 20,
      marginRight: theme.spacing.unit
   },
   rightIcon: {
      fontSize: 20,
      marginLeft: theme.spacing.unit
   },
   button: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit,
      marginLeft: 0
   }
});

export default withStyles(styles)(CreatePin);
