import { useState, useEffect } from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { Pedometer } from "expo-sensors";
import AnimatedProgressWheel from "react-native-progress-wheel";

export default function App() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [currentStepCount, setCurrentStepCount] = useState(0);

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

  useEffect(() => {
    const subscription = subscribe();
    return () => {
      const clear = async () => {
        return async () => subscription && (await subscription)?.remove();
      };

      StatusBar.setHidden(true);
      clear();
    };
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <AnimatedProgressWheel
          max={1000}
          showProgressLabel={true}
          labelStyle={styles.text}
          subtitle={"Steps"}
          subtitleStyle={styles.subtext}
          color={"#010"}
          backgroundColor={"transparent"}
          containerColor={"transparent"}
          size={350}
          width={20}
          progress={currentStepCount}
          rounded={false}
        />
      </View>
    </View>
  );
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
