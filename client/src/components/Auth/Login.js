import React, { useContext } from "react";
import { GoogleLogin } from "react-google-login";
import { GraphQLClient } from "graphql-request";

import { withStyles } from "@material-ui/core/styles";
import Context from "../../context";

import Typography from "@material-ui/core/Typography";
import { ME_QUERY } from "../../graphql/queries";
import { BASE_URL } from "../../client";

const Login = ({ classes }) => {
   const { dispatch } = useContext(Context);

   const onSuccess = async googleUser => {
      try {
         const idToken = googleUser.getAuthResponse().id_token;
         localStorage.setItem("authToken", idToken);

         const client = new GraphQLClient(BASE_URL, {
            headers: { authorization: idToken }
         });
         const { me } = await client.request(ME_QUERY);

         dispatch({ type: "LOGIN_USER", payload: me });
         dispatch({ type: "IS_LOGGED_IN", payload: googleUser.isSignedIn() });
         console.log("here");
      } catch (error) {
         onFailure(error);
      }
   };
   const onFailure = error => {
      console.error("error logging in ", error);
      dispatch({ type: "IS_LOGGED_IN", payload: false });
   };
   return (
      <div className={classes.root}>
         <Typography
            component="h1"
            variant="h3"
            gutterBottom
            noWrap
            style={{ color: "rgb(66, 133, 244)" }}
         >
            Welcome
         </Typography>
         <GoogleLogin
            clientId="976298835840-2efr66carnjbjo4tv6le76tq4khojg43.apps.googleusercontent.com"
            onSuccess={onSuccess}
            onFailure={onFailure}
            isSignedIn
            buttonText="Login with Google"
            theme="dark"
         />
      </div>
   );
};

const styles = {
   root: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      alignItems: "center"
   }
};

export default withStyles(styles)(Login);
