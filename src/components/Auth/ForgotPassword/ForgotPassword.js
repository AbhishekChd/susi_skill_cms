import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* Material-UI*/
import Close from 'material-ui/svg-icons/navigation/close';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';

/* Utils*/
import $ from 'jquery';
import { colors, urls } from '../../../utils';

/* CSS*/
import './ForgotPassword.css';

const styles = {
  containerStyle: {
    width: '100%',
    textAlign: 'center',
    padding: '10px',
  },
  underlineFocusStyle: {
    color: colors.header,
  },
  closingStyle: {
    position: 'absolute',
    zIndex: 1200,
    fill: '#444',
    width: '26px',
    height: '26px',
    right: '10px',
    top: '10px',
    cursor: 'pointer',
  },
};

export default class ForgotPassword extends Component {
  static propTypes = {
    history: PropTypes.object,
    updateAuthDialog: PropTypes.func,
    updateSnackbar: PropTypes.func,
    closeDialog: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      success: false,
      checked: false,
      emailError: true,
      validEmail: true,
      validForm: false,
      loading: false,
      emailErrorMessage: '',
    };
  }

  handleChange = event => {
    let {
      email,
      validEmail,
      emailError,
      emailErrorMessage,
      validForm,
    } = this.state;

    if (event.target.name === 'email') {
      email = event.target.value.trim();
      validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
      emailError = !(validEmail && email);
    }

    if (emailError) {
      if (!email) {
        emailErrorMessage = 'This Field Is Required';
      } else if (!validEmail) {
        emailErrorMessage = 'Invalid Email';
      }
      validForm = false;
    } else {
      emailErrorMessage = '';
      validForm = true;
    }

    this.setState({
      email,
      validEmail,
      emailError,
      emailErrorMessage,
      validForm,
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { updateSnackbar, closeDialog } = this.props;
    let { email, success } = this.state;
    email = email.trim();
    let validEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
    let BASE_URL = urls.API_URL;
    let message = '';

    this.setState({ loading: true });

    if (email && validEmail) {
      $.ajax({
        url: `${BASE_URL}/aaa/recoverpassword.json?forgotemail=${email}`,
        dataType: 'jsonp',
        crossDomain: true,
        timeout: 3000,
        statusCode: {
          422: function() {
            message = 'Email does not exist';
            this.setState({ loading: false }, () => {
              updateSnackbar && updateSnackbar(message);
            });
          }.bind(this),
        },
        success: function(response) {
          message = `${response.message}.`;
          if (response.accepted) {
            success = true;
          } else {
            success = false;
            message += ' Please Try Again.';
          }
          this.setState({ success, loading: false }, () => {
            updateSnackbar && updateSnackbar(message);

            if (success) {
              setTimeout(() => {
                closeDialog && closeDialog();
              }, 2000);
            }
          });
        }.bind(this),
        error: function(jqXHR, textStatus, errorThrown) {
          let jsonValue = jqXHR.status;
          message = '';
          if (jsonValue === 404) {
            message = 'Email does not exist.';
          } else {
            message = 'Failed. Try Again.';
          }
          this.setState({ loading: false }, () => {
            updateSnackbar && updateSnackbar(message);
          });
        }.bind(this),
      });
    }
  };

  render() {
    let { email, message, emailErrorMessage, validForm, loading } = this.state;
    const { containerStyle, underlineFocusStyle, closingStyle } = styles;

    return (
      <div className="forgotPasswordForm">
        <Paper zDepth={0} style={containerStyle}>
          <h3>Forgot Password?</h3>
          <form onSubmit={this.handleSubmit}>
            <div>
              <TextField
                name="email"
                floatingLabelText="Email"
                errorText={emailErrorMessage}
                value={email}
                underlineFocusStyle={underlineFocusStyle}
                floatingLabelFocusStyle={underlineFocusStyle}
                onChange={this.handleChange}
              />
            </div>
            <div>
              <RaisedButton
                type="submit"
                label={!loading ? 'Reset' : ''}
                backgroundColor={colors.header}
                labelColor="#fff"
                style={{ margin: '25px 0 0 0 ' }}
                disabled={!validForm}
                icon={loading ? <CircularProgress size={24} /> : undefined}
              />
            </div>
          </form>
        </Paper>
        {message && (
          <div>
            <Dialog modal={false} open={true} onRequestClose={this.handleClose}>
              {message}
              <Close style={closingStyle} onClick={this.handleClose} />
            </Dialog>
          </div>
        )}
      </div>
    );
  }
}
