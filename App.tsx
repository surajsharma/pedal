import { useState, useEffect } from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";
import { Pedometer } from "expo-sensors";
import CircularProgress from "react-native-circular-progress-indicator";

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
      <CircularProgress
        value={currentStepCount}
        initialValue={0}
        radius={180}
        duration={200}
        progressValueColor={"darkgreen"}
        maxValue={100}
        title={"STEPS"}
        titleColor={"green"}
        titleStyle={{ fontWeight: "100" }}
        allowFontScaling={true}
      />
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
