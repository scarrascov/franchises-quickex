import * as React from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button, Appbar, Dialog, Portal, Paragraph, Provider } from 'react-native-paper';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import constants from '../config/constants';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';


export default class MainScreen extends React.Component {
  constructor(props) { 
    super(props);
      this.state = {
        data : {},
        order_id:'',
        token: '',
        error_visible:false,
        error_message:"",
        lastScannedUrl: null,
        disabled:false,
        button_text:"Buscar Orden",
        icon:"file-search",
        hasCameraPermission: null,
        scanned: false,
      };
  }
  

  _handleMore = () => console.log('Shown more');
  _showDialog = () => this.setState({ error_visible: true });
  _hideDialog = () => this.setState({ error_visible: false });

  getOrderData = () => {
    try{
      this.setState({
        disabled:true,
        button_text:"Buscando Orden",
        icon:"loading"
      });
      dismissKeyboard();
      fetch(constants.API_URL + 'wc/v3/orders/' + this.state.order_id, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.state.data.token
        }
        
        }).then((response) => response.json()
        ).then((r) => {
          this.setState({
            disabled:false,
            button_text:"Buscar Orden",
            icon:"file-search"
          });
          if(typeof(r.data) !=='undefined' && r.data.status == 404){
  
            this.setState( {
              error_message:'El número de orden indicado no es correcto, favor revise y vuelva a intentar', 
              error_visible:true,
            });
          }
          else {
            this.props.navigation.navigate('Detalle', {data: this.state.data, order: r});
          }
            
        }).catch((error)=>{
          this.setState({
            disabled:false,
            button_text:"Buscar Orden",
            icon:"file-search",
            error_message:'Ha ocurrido un error: '+ error.message, 
            error_visible:true,
          });
        });
    }
    catch(e){
      this.setState({
        disabled:false,
        button_text:"Buscar Orden",
        icon:"file-search",
        error_message:'Ha ocurrido un error: '+ e.message, 
        error_visible:true,
      });
    }
  }
  componentDidMount(){
    const { navigation } = this.props;
    this.setState({data:navigation.getParam('data', {})})
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async() => {
    const {
      status
    } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  handleBarCodeScanned = ({type,data}) => {
    this.setState({
      order_id: data
    });
    this.getOrderData();

  };

  render() {
    const { hasCameraPermission, scanned} = this.state;

    if (hasCameraPermission === null) {
      return <Text>Solicitando permisos uso camara</Text>;
    }
    if (hasCameraPermission === false) {
      this.getPermissionsAsync();
    }
    return (
      <Provider>
        <Portal>

          <Appbar.Header>
            <Appbar.Content
              title="Quickex"
              subtitle={"Bienvenido " + this.state.data.user_display_name}
            />
            <Appbar.Action icon="dots-vertical" onPress={this._handleMore} />
          </Appbar.Header>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
          <View style={styles.Camera}>
            <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned} style = {StyleSheet.absoluteFillObject}/>     
          </View>
            
          <View style={styles.container}>
            <View style={styles.inputView}>
              <TextInput label='Orden de Compra' placeholder="Ingrese Numero de orden" keyboardType="number-pad" style={styles.inputText} onChangeText={text => this.setState({order_id:text})} value={this.state.order_id}/>
            </View>
            <View style = {{flex: 1,flexDirection: 'column',justifyContent: 'flex-end',}} >
                <Button style={styles.button} icon={this.state.icon} disabled={this.state.disabled} mode="contained" onPress={this.getOrderData}>
                  {this.state.button_text}
                </Button>
            </View> 
          </View>
          <Dialog
             visible={this.state.error_visible}
             onDismiss={this._hideDialog}>
            <Dialog.Title>Error</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{this.state.error_message}</Paragraph>
            </Dialog.Content>
          </Dialog>
          </KeyboardAvoidingView>
          
          
        </Portal>
        
      </Provider>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"100%",
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  Camera: {
    flex:1,
    flexDirection:'row-reverse',
    width:'100%',
    backgroundColor: '#000',
  },
  button: {
    marginBottom:5,
    resizeMode: "contain",
    alignSelf: "center",
    padding:5
  },
  logo:{
    flex: 1,
    width: "30%",
    resizeMode: "contain",
    alignSelf: "center",
    top:-30
  },
  inputView:{
    width:"100%",
    backgroundColor:"#fff",
    marginTop:20,
    justifyContent:"center",

  },
  inputText:{
    backgroundColor:"#fff",
    color:"#fff"
  },
  form: {
    flex: 1,
    justifyContent: 'space-between',
  },
});