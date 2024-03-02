import { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, StatusBar, Platform } from "react-native";
import { Pedometer } from "expo-sensors";

import CircularProgress from "react-native-circular-progress-indicator";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import type { Notification } from "expo-notifications";
import Constants from "expo-constants";

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<Notification>();
  const [notificationDelivered, setNotificationDelivered] = useState(false);
  // const notificationListener = useRef();
  // const responseListener = useRef();

  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const maxStepCount = 1;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const subscribe = async () => {
    const isAvailable = await Pedometer.isAvailableAsync();
    setIsPedometerAvailable(String(isAvailable));

    let permission = await Pedometer.requestPermissionsAsync();

    if (isAvailable) {
      return Pedometer.watchStepCount((result) => {
        if (permission.granted) setCurrentStepCount(result.steps);
      });
    }
  };

  const notificationSetup = () => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(`notification trigerred @ ${currentStepCount}`);
        setNotification(notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  useEffect(() => {
    const subscription = subscribe();

    return () => {
      const clear = async () => {
        return async () => subscription && (await subscription)?.remove();
      };

      StatusBar.setHidden(true);
      StatusBar.setBackgroundColor("#010");

      clear();
      notificationSetup();
    };
  }, []);

  useEffect(() => {
    const s = async () => {
      if (currentStepCount >= maxStepCount) {
        if (!notificationDelivered) {
          schedulePushNotification();
          setNotificationDelivered(true);
        }
      }
    };

    s();
  }, [currentStepCount]);

  return (
    <View style={styles.container}>
      <CircularProgress
        value={currentStepCount}
        initialValue={0}
        radius={180}
        duration={200}
        progressValueColor={"darkgreen"}
        maxValue={maxStepCount}
        title={"STEPS"}
        titleColor={"green"}
        titleStyle={{ fontWeight: "100" }}
        allowFontScaling={true}
      />
    </View>
  );
}

async function schedulePushNotification() {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've hit your daily steps target! 🎯",
      body: "Congrats! You have achieved your steps for the day!",
    },
    trigger: { seconds: 2 },
  });
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;

    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  return token;
}

const styles = StyleSheet.create({
  offset: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },

  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#010",
  },

  text: {
    color: "#0d0",
    fontSize: 80,
  },

  subtext: {
    color: "#9a9",
    fontSize: 25,
  },
});
