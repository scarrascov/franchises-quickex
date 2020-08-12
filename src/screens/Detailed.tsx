import React from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Button, Appbar, Dialog, Portal, Paragraph, Provider, DataTable } from 'react-native-paper';
import constants from '../config/constants';
import Moment from 'moment';
import * as ImagePicker from 'expo-image-picker';

export default class DetailedScreen extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        data:{},
        order:{},
        ben:{},
        customer:{},
        order_id:'',
        token: '',
        error_visible:false,
        error_message:"",
        icon:"finance",
        button_text:"Recibir Pago",
        disabled:true,
        showButtons : false
      };
  }
  _goBack = () => this.props.navigation.navigate('Inicio', {data: this.state.data});

  _handleMore = () => console.log('Shown more');
  
  _showDialog = () => this.setState({ error_visible: true });
  _hideDialog = () => this.setState({ error_visible: false });
  _hideButtons = () => this.setState({ showButtons : false});
  _showButtons = () => this.setState({ showButtons : true});


  _renderButtons = () => {
    if (this.state.showButtons) {
        return (
          <View style={styles.inputView}>
            <View style={styles.inputView}>
                <Button icon="close-box" disabled={this.state.disabled} mode="text" onPress={this.anularOrden}>
                    Anular Orden
                </Button>
            </View>
            <View style={styles.inputView}>
                <Button icon={this.state.icon} disabled={this.state.disabled} mode="contained" style={styles.button} onPress={this.openCamera}>
                    {this.state.button_text}
                </Button>
              </View>
              
          </View>
        )
    } else {
        return null;
    }
}

  getBeneficiaryData = () => {
    try{
      fetch(constants.API_URL + 'beneficiary/' + this.state.order.meta_data.find(item => item.key === '_beneficiary_id' ).value, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.state.data.token
        }
        
        }).then((response) => response.json()
        ).then((r) => {
            this.setState({ben: r});
            fetch(constants.API_URL + 'wp/v2/users/' + r.customer_id, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.state.data.token
                }
                }).then((response) => response.json()
                ).then((r) => {
                    this.setState({
                      customer: r,
                      disabled:false
                    });

                }).catch((error)=>{
                    console.log(error.message)
                });
        }).catch((error)=>{
            console.log(error.message)
        });
    }
    catch(e){
      this.setState({
        button_text:"Procesar Pago",
        disabled:false,
        error_message: "Ocurrio un error recibiendo datos " + e.message,
        error_visible:true
      });
      this._goBack();
    }

  }
  openCamera = async() => {
    this.setState({
      disabled:true,
      button_text:"Actualizando Orden",
      icon:"loading"
    });
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7
    });
  
    if (!result.cancelled) {
      let filename = result.uri.split('/').pop();
      fetch(constants.API_URL + 'wp/v2/media', {
        method: 'post',
        headers: {
          'Content-Type': 'image/jpeg',
          'Authorization': 'Bearer ' + this.state.data.token,
          'Content-Disposition': 'attachment; filename="'+ filename +'"'
        },                
        body: result
      }).then((response) => response.json()
      ).then((r) => { 
        fetch(constants.API_URL + 'wp/v2/media/' + r.id, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.state.data.token          },                
          body: JSON.stringify({
            post: this.state.order.id
          })
        }).then((resp) => resp.json()).then((x) => {
          console.log(x);
          this.updateOrderStatus();
        });
       });
    }
    
  }

  updateOrderStatus = async() => {
    fetch(constants.API_URL + 'wc/v3/orders/' + this.state.order.id, {
      method: 'PUT',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.data.token
      },
      body: JSON.stringify({
          status: "processing"
      }),
      
      }).then((response) => response.json()
      ).then((r) => {    
          this.setState({
            order:r,
            icon:"finance",
            button_text:"Recibir Pago",
            error_message: "Transaccion procesada correctamente",
            error_visible:true
          });
      }).catch((error)=>{
          this.setState({error_message: "Transaccion Con problemas: " + error.message, error_visible: true })
      });

  }

  anularOrden = () => {
  try{
    fetch(constants.API_URL + 'wc/v3/orders/' + this.state.order.id, {
      method: 'PUT',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.data.token
      },
      body: JSON.stringify({
          status: "failed"
      }),
      
      }).then((response) => response.json()
      ).then((r) => {    
          this.setState({
            order:r,
            error_message: "Transaccion anulada correctamente",
            error_visible:true
          });
      }).catch((error)=>{
          this.setState({error_message: "Transaccion Con problemas: " + error.message, error_visible: true })
      });
  }
  catch(e){
    this.setState({
      error_message: "Ocurrio un error recibiendo datos " + e.message,
      error_visible:true
    });
  }
    return;
  }
UNSAFE_componentWillMount(){
  const { navigation } = this.props;
  this.setState({
    data:navigation.getParam('data', {}),
    order:navigation.getParam('order', {})
    
  });
  
}

componentDidMount(){
  if(this.state.order.payment_method == 'franchise'){
    this._showButtons();
  }
  this.getBeneficiaryData();
}

render() {
    return (
      <Provider>
        <Portal>
        
          <Appbar.Header>
            <Appbar.BackAction
                onPress={this._goBack}
            />
            <Appbar.Content
              title={"Orden Número " + this.state.order.id}
              subtitle={this.state.order.status.toUpperCase()}
            />
            <Appbar.Action icon="dots-vertical" onPress={this._handleMore} />
          </Appbar.Header>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : null} style={{ flex: 1 }}>
          <View style={styles.container}>
            <ScrollView style={styles.inputView}>
            <DataTable>
                    <DataTable.Row>
                        <DataTable.Title>Fecha Creación</DataTable.Title>
                        <DataTable.Cell>{Moment(this.state.order.date_created).format('D/MM/YYYY HH:mm')}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Monto</DataTable.Title>
                        <DataTable.Cell>{this.state.order.line_items[0].meta_data.find(item => item.key === 'cur_from' ).value.toUpperCase() + " " + this.state.order.line_items[0].meta_data.find(item => item.key === 'custom_price' ).value.toUpperCase()}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Remitente</DataTable.Title>
                        <DataTable.Cell>{this.state.customer.name}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Destino</DataTable.Title>
                        <DataTable.Cell>{this.state.order.line_items[0].meta_data.find(item => item.key === 'cur_to' ).value.toUpperCase() + " " + this.state.order.line_items[0].meta_data.find(item => item.key === 'cur_second_amout' ).value.toUpperCase()}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Medio Pago</DataTable.Title>
                        <DataTable.Cell>{this.state.order.payment_method_title}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Beneficiario</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.name}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Documento Identificación</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.type_id + " " + this.state.ben.identification_number}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Dirección</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.address}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>País</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.country == 'VE' ? "Venezuela" : this.state.ben.country}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Banco</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.bank}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Tipo Cuenta</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.bank_account_type}</DataTable.Cell>
                    </DataTable.Row>
                    <DataTable.Row>
                        <DataTable.Title>Número Cuenta</DataTable.Title>
                        <DataTable.Cell>{this.state.ben.account_number}</DataTable.Cell>
                    </DataTable.Row>
                    
                </DataTable>
            </ScrollView>
             
            {this._renderButtons()}
          </View>
          <Dialog
             visible={this.state.error_visible}
             onDismiss={this._hideDialog}>
            <Dialog.Title>Estado</Dialog.Title>
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
    width:"100%",
    backgroundColor:"#fff",
    marginTop:20,

  },
  button: {
    marginBottom:0,
    resizeMode: "contain",
    alignSelf: "center",
    padding:20,
    width:'110%'
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