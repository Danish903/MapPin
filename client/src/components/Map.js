import React, { useState, useEffect, useContext } from "react";
import { Subscription } from "react-apollo";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";
import { withStyles } from "@material-ui/core/styles";
import ReactMapGl, { NavigationControl, Marker, Popup } from "react-map-gl";
import PinIcon from "./PinIcon";
import Context from "../context";
import Blog from "./Blog";
import { useClient } from "../client";
import { GET_PINS_QUERY } from "../graphql/queries";
import differenceInMinutes from "date-fns/difference_in_minutes";

import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import {
   PIN_DELETED_SUBSCRIPTION,
   PIN_ADDED_SUBSCRIPTION,
   PIN_UPDATED_SUBSCRIPTION
} from "../graphql/subscriptions";

const INITIAL_VIEWPORT = {
   latitude: 37.7577,
   longitude: -122.4376,
   zoom: 13
};
const Map = ({ classes }) => {
   const client = useClient();

   const mobileSize = useMediaQuery("(max-width: 650px)");
   const { state, dispatch } = useContext(Context);

   useEffect(() => {
      getPins();
   }, []);

   const [viewPort, setViewport] = useState(INITIAL_VIEWPORT);
   const [userPosition, setUserPosition] = useState(null);

   useEffect(() => {
      getUserPosition();
   }, []);

   const [popup, setPopup] = useState(null);

   useEffect(() => {
      const pinExists =
         popup && state.pins.findIndex(pin => pin._id === popup._id) > -1;
      if (!pinExists) {
         setPopup(null);
      }
   }, [state.pins.length]);
   const getPins = async () => {
      const { getPins } = await client.request(GET_PINS_QUERY);
      dispatch({ type: "GET_PINS", payload: getPins });
   };

   const getUserPosition = () => {
      if ("geolocation" in navigator) {
         navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setViewport({ ...viewPort, latitude, longitude });
            setUserPosition({ latitude, longitude });
         });
      }
   };
   const handleMapClick = ({ lngLat, leftButton }) => {
      if (!leftButton) return;

      if (!state.draft) {
         dispatch({ type: "CREATE_DRAFT" });
      }
      const [longitude, latitude] = lngLat;
      dispatch({
         type: "UPDATE_DRAFT_LOCATION",
         payload: { latitude, longitude }
      });
   };

   const highLightNewPin = pin => {
      const isNewPin =
         differenceInMinutes(Date.now(), Number(pin.createdAt)) <= 30;
      return isNewPin ? "limegreen" : "darkgreen";
   };

   const handleSelectPin = pin => {
      setPopup(pin);
      dispatch({ type: "SET_PIN", payload: pin });
   };

   const isAuthUser = () => state.currentUser._id === popup.author._id;

   const handleDeletePin = async () => {
      const { _id } = popup;
      const variables = { pinId: _id };
      try {
         await client.request(DELETE_PIN_MUTATION, variables);

         setPopup(null);
      } catch (error) {
         console.log(error);
      }
   };

   return (
      <div className={mobileSize ? classes.rootMobile : classes.root}>
         <ReactMapGl
            width="100vw"
            height="calc(100vh - 64px)"
            mapStyle="mapbox://styles/mapbox/streets-v9"
            mapboxApiAccessToken="pk.eyJ1IjoiYW5zaWRoZGh1bmdlbCIsImEiOiJjanQ5N2piNWYwZ29kM3ludjI0NjRoMTdvIn0.45TM2Lvhm1_9NZ5J5u2zEA"
            {...viewPort}
            onViewportChange={newViewPort => setViewport(newViewPort)}
            onClick={handleMapClick}
            scrollZoom={!mobileSize}
         >
            <div className={classes.navigationControl}>
               <NavigationControl
                  onViewportChange={newViewPort => setViewport(newViewPort)}
               />
            </div>
            {userPosition && (
               <Marker
                  latitude={userPosition.latitude}
                  longitude={userPosition.longitude}
                  offsetLeft={-19}
                  offsetTop={-37}
               >
                  <PinIcon size={40} color="red" />
               </Marker>
            )}
            {state.draft && (
               <Marker
                  latitude={state.draft.latitude}
                  longitude={state.draft.longitude}
                  offsetLeft={-19}
                  offsetTop={-37}
               >
                  <PinIcon size={40} color="hotpink" />
               </Marker>
            )}
            {/* createdPins  */}
            {state.pins.map(pin => (
               <Marker
                  key={pin._id}
                  latitude={pin.latitude}
                  longitude={pin.longitude}
                  offsetLeft={-19}
                  offsetTop={-37}
               >
                  <PinIcon
                     size={40}
                     color={highLightNewPin(pin)}
                     onClick={() => handleSelectPin(pin)}
                  />
               </Marker>
            ))}
            {/* Pop up Dialog for created Pins */}
            {popup && !state.draft && (
               <Popup
                  anchor="top"
                  latitude={popup.latitude}
                  longitude={popup.longitude}
                  closeOnClick={false}
                  onClose={() => setPopup(null)}
               >
                  <img
                     className={classes.popupImage}
                     src={popup.image}
                     alt={popup.title}
                  />
                  <div className={classes.popupTab}>
                     <Typography>
                        {popup.latitude.toFixed(6)},{" "}
                        {popup.longitude.toFixed(6)}
                     </Typography>
                     {isAuthUser() && (
                        <Button onClick={handleDeletePin}>
                           <DeleteIcon className={classes.deleteIcon} />
                        </Button>
                     )}
                  </div>
               </Popup>
            )}
         </ReactMapGl>

         {/* Subscription for CREATING / updating / deleting PIN */}
         <Subscription
            subscription={PIN_ADDED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
               const { pinAdded } = subscriptionData.data;
               dispatch({ type: "CREATE_PIN", payload: pinAdded });
            }}
         />

         <Subscription
            subscription={PIN_UPDATED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
               const { pinUpdated } = subscriptionData.data;
               dispatch({ type: "CREATE_COMMENT", payload: pinUpdated });
            }}
         />
         <Subscription
            subscription={PIN_DELETED_SUBSCRIPTION}
            onSubscriptionData={({ subscriptionData }) => {
               const { pinDeleted } = subscriptionData.data;
               dispatch({ type: "DELETE_PIN", payload: pinDeleted._id });
            }}
         />

         <Blog />
      </div>
   );
};

const styles = {
   root: {
      display: "flex"
   },
   rootMobile: {
      display: "flex",
      flexDirection: "column-reverse"
   },
   navigationControl: {
      position: "absolute",
      right: 0,
      bottom: 8,
      margin: "1em"
   },
   deleteIcon: {
      color: "red"
   },
   popupImage: {
      padding: "0.4em",
      height: 200,
      width: 200,
      objectFit: "cover"
   },
   popupTab: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column"
   }
};

export default withStyles(styles)(Map);
