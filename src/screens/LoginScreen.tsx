import React from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, Keyboard } from 'react-native';
import imageLogo from "../assets/images/logo.png";
import constants from '../config/constants';
import { TextInput, Button, Dialog, Portal, Paragraph, Provider } from 'react-native-paper';
import dismissKeyboard from 'react-native-dismiss-keyboard';

export default class LoginScreen extends React.Component {
  
  constructor(props) {
    super(props);
      this.state = {
        email:'',
        password:'',
        error_visible:false,
        error_message:"",
        disabled:false,
        button_text:"Iniciar Sesión",
        icon:"account-box"
      };
  }
  _showDialog = () => this.setState({ error_visible: true });
  _hideDialog = () => this.setState({ error_visible: false });

  login = () => {
    dismissKeyboard();
    this.setState({
      disabled:true,
      button_text:"Iniciando Sesión",
      icon:"loading"
    });
    let email = this.state.email;
    let passwd = this.state.password;

    fetch(constants.API_URL + 'jwt-auth/v1/token', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: email,
            password: passwd,
        }),
    }).then((response) => response.json()
    ).then((r) => {
          console.log(r);
          if(r.token){
            this.props.navigation.navigate('Inicio', {data: r});
          }
          else if(r.data.status == 403){
            this.setState( {
              error_message:'Nombre de usuario o Contraseña incorrecta', 
              error_visible:true,
              disabled:false,
              button_text:"Iniciar Sesión",
              icon:"account-box"
            });
          }
    }).catch((error)=>{
      this.setState({
        disabled:false,
        button_text:"Iniciar Sesión",
        icon:"account-box"
      });
        console.log(error.message)
    })
    ;
    

  };
  render(){
    return (
      <Provider>
        <Portal>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
          <View style={styles.container}>
            <Image source={imageLogo} style={styles.logo} />
            <View style={styles.inputView} >
              <TextInput label='Correo Electrónico' keyboardType="email-address" autoCapitalize = 'none' style={styles.inputText}  value={this.state.email} onChangeText={text => this.setState({email:text})}/>
            </View>
            <View style={styles.inputView} >
            <TextInput label='Password' secureTextEntry={true} autoCorrect={false} style={styles.inputText} value={this.state.password} onChangeText={text => this.setState({ password:text })}/>
            </View>
              <Button style={styles.button} icon={this.state.icon} mode="contained" disabled={this.state.disabled} onPress={this.login}>
                {this.state.button_text}
              </Button>
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
  
  logo:{
    flex: 1,
    width: "30%",
    resizeMode: "contain",
    alignSelf: "center",
    top:-30
  },
  inputView:{
    width:"80%",
    backgroundColor:"#fff",
    marginTop:-10,
    height:40,
    marginBottom:20,
    justifyContent:"center",

  },
  inputText:{
    backgroundColor:"#fff",
    color:"#fff"
  },
  button: {
    marginBottom:5,
    resizeMode: "contain",
    alignSelf: "center",
    padding:5,
    marginTop:5
  },
  form: {
    flex: 1,
    justifyContent: 'space-between',
  },
});