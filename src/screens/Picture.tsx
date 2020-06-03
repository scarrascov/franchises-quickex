import React from 'react';
import { Text, View ,TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import { FontAwesome, Ionicons,MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';




export default class PictureScreen extends React.Component {
  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.back,
    data:{},
    order:{}
  }

  UNSAFE_componentWillMount(){
    const { navigation } = this.props;
    this.setState({
      data:navigation.getParam('data', {}),
      order:navigation.getParam('order', {})
    });
  }

  async componentDidMount() {
    this.getPermissionAsync()
  }

  getPermissionAsync = async () => {

    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    if (status !== 'granted') {
      alert('Necesita autorizar el uso de la camara para continuar');
    }
    // Camera Permission
    this.setState({ hasPermission: status === 'granted' });
  }

  handleCameraType=()=>{
    const { cameraType } = this.state

    this.setState({cameraType:
      cameraType === Camera.Constants.Type.back
      ? Camera.Constants.Type.front
      : Camera.Constants.Type.back
    })
  }

  takePicture = async () => {
      const { uri } = this.camera.takePictureAsync();
      const asset = await MediaLibrary.createAssetAsync(uri);
      MediaLibrary.createAlbumAsync('Quickex', asset)
      .then(() => {
        Alert.alert('Album created!')
      })
      .catch(error => {
        Alert.alert('An Error Occurred!')
      });
  }

  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });
  }
  

  render(){
    const { hasPermission } = this.state
    if (hasPermission === null) {
      return <View />;
    } else if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
          <View style={{ flex: 1 }}>
            <Camera style={{ flex: 1 }} type={this.state.cameraType}  ref={ref => {this.camera = ref}}>
              <View style={{flex:1, flexDirection:"row",justifyContent:"space-between",margin:30}}>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent'                 
                  }}
                  onPress={()=>this.pickImage()}>
                  <Ionicons
                      name="ios-photos"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                  onPress={()=>this.takePicture()}
                  >
                  <FontAwesome
                      name="camera"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                  }}
                  onPress={()=>this.handleCameraType()}
                  >
                  <MaterialCommunityIcons
                      name="camera-switch"
                      style={{ color: "#fff", fontSize: 40}}
                  />
                </TouchableOpacity>
              </View>
            </Camera>
        </View>
      );
    }
  }
  
}