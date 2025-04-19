"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native"
import { CameraView, useCameraPermissions } from "expo-camera"
import { manipulateAsync, SaveFormat } from "expo-image-manipulator"
import { X, Camera as CameraIcon, RotateCcw } from "lucide-react-native"
import type { CameraCapturedPicture } from "expo-camera"

interface CameraCaptureProps {
  onCapture: (uri: string) => void
  onCancel: () => void
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<"front" | "back">("back")
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const cameraRef = useRef<CameraView | null>(null)

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission().then(({ granted }) => {
        if (!granted) {
          Alert.alert("Camera access is required.", "", [{ text: "OK", onPress: onCancel }])
        }
      })
    }
  }, [permission])

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        setIsCapturing(true)

        // ✅ FIXED: Cast result as CameraCapturedPicture
        const photo = (await cameraRef.current.takePictureAsync()) as CameraCapturedPicture

        const result = await manipulateAsync(photo.uri, [{ resize: { width: 800 } }], {
          compress: 0.7,
          format: SaveFormat.JPEG,
        })

        setCapturedImage(result.uri)
      } catch (e) {
        console.error("Failed to take picture:", e)
        Alert.alert("Error", "Failed to take picture")
      } finally {
        setIsCapturing(false)
      }
    }
  }

  const retakePicture = () => setCapturedImage(null)
  const confirmPicture = () => capturedImage && onCapture(capturedImage)

  if (!permission || permission.status === "undetermined") {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#5E72E4" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.actionButton} onPress={retakePicture}>
              <RotateCcw size={24} color="#fff" />
              <Text style={styles.actionText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={confirmPicture}>
              <Text style={styles.actionText}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            enableTorch={false}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </CameraView>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={isCapturing}>
              {isCapturing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CameraIcon size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#5E72E4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    margin: 20,
  },
  button: {
    backgroundColor: "#5E72E4",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  preview: {
    flex: 1,
    resizeMode: "contain",
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#444",
  },
  confirmButton: {
    backgroundColor: "#5E72E4",
  },
  actionText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
})
