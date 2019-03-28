import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import Context from "./context";

const ProtectedRoute = ({ component: Component, ...rest }) => {
   const {
      state: { isAuth }
   } = useContext(Context);

   return (
      <Route
         {...rest}
         render={props =>
            isAuth ? <Component {...props} /> : <Redirect to="/login" />
         }
      />
   );
};

export default ProtectedRoute;
