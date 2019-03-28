export default function reducer(state, { type, payload }) {
   switch (type) {
      case "LOGIN_USER":
         return {
            ...state,
            currentUser: payload
         };
      case "IS_LOGGED_IN":
         return {
            ...state,
            isAuth: payload
         };
      case "SIGNOUT_USER":
         return {
            ...state,
            currentUser: null,
            isAuth: false
         };
      case "CREATE_DRAFT":
         return {
            ...state,
            draft: {
               latitude: 0,
               longitude: 0
            },
            currentPin: null
         };
      case "UPDATE_DRAFT_LOCATION":
         return {
            ...state,
            draft: payload
         };
      case "DELETE_DRAFT":
         return {
            ...state,
            draft: null
         };
      case "GET_PINS":
         return {
            ...state,
            pins: payload
         };
      case "CREATE_PIN":
         const newPin = payload;
         const prevPins = state.pins.filter(pin => pin._id !== newPin._id);
         return {
            ...state,
            pins: [...prevPins, newPin]
         };
      case "SET_PIN":
         return {
            ...state,
            currentPin: payload,
            draft: null
         };
      case "DELETE_PIN":
         if (state.currentPin) {
            const isCurrentPin = state.currentPin._id === payload;
            if (isCurrentPin) {
               return {
                  ...state,
                  pins: state.pins.filter(pin => pin._id !== payload),
                  currentPin: null
               };
            }
         }

         return {
            ...state,
            pins: state.pins.filter(pin => pin._id !== payload)
         };
      case "CREATE_COMMENT":
         const updatedPin = state.pins.map(pin =>
            pin._id === payload._id ? payload : pin
         );
         return {
            ...state,
            pins: updatedPin,
            currentPin: payload
         };
      default:
         return state;
   }
}
