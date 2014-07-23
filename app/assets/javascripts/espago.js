(function() {
  var Base64, CreditCard, Espago, EspagoConnection, root,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      output = "";
      i = 0;
      input = Base64._utf8_encode(input);
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else {
          if (isNaN(chr3)) {
            enc4 = 64;
          }
        }
        output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
    },
    decode: function(input) {
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4, i, output;
      output = "";
      i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 !== 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = Base64._utf8_decode(output);
      return output;
    },
    _utf8_encode: function(string) {
      var c, n, utftext;
      string = string.replace(/\r\n/g, "\n");
      utftext = "";
      n = 0;
      while (n < string.length) {
        c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
        n++;
      }
      return utftext;
    },
    _utf8_decode: function(utftext) {
      var c, c1, c2, c3, i, string;
      string = "";
      i = 0;
      c = c1 = c2 = 0;
      while (i < utftext.length) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        } else if ((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i + 1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        } else {
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
  };

  String.prototype.remove_white_spaces = function() {
    return this.replace(/\s+|-/g, "");
  };

  String.prototype.length_between = function(start, end) {
    return this.length >= start && this.length <= end;
  };

  String.prototype.element_value = function() {
    return document.querySelector(this).value;
  };

  CreditCard = (function() {

    function CreditCard(options) {
      if (options == null) {
        options = {};
      }
      this.number = options.number;
      this.cvc = options.cvc;
      this.month = options.month;
      this.year = options.year;
      this.first_name = options.first_name;
      this.last_name = options.last_name;
    }

    CreditCard.prototype.validate = function() {
      return this.validate_card_number() && this.validate_cvc() && this.validate_date() && this.validate_first_name() && this.validate_last_name();
    };

    CreditCard.prototype.validate_first_name = function() {
      if (this.first_name === "" || this.first_name === void 0) {
        return false;
      }
      return true;
    };

    CreditCard.prototype.validate_last_name = function() {
      if (this.last_name === "" || this.last_name === void 0) {
        return false;
      }
      return true;
    };

    CreditCard.prototype.validate_date = function() {
      var expiry, today;
      if (this.month > 12 || this.month < 1) {
        return false;
      }
      today = new Date();
      expiry = new Date(this.year, this.month);
      return today.getTime() <= expiry.getTime();
    };

    CreditCard.prototype.validate_cvc = function() {
      var cvc;
      cvc = this.cvc.remove_white_spaces();
      return /^\d+$/.test(cvc) && cvc.length_between(3, 4);
    };

    CreditCard.prototype.validate_card_number = function() {
      var number;
      number = this.number.remove_white_spaces();
      return number.length_between(12, 19) && this.is_valid_identifier(number);
    };

    CreditCard.prototype.is_valid_identifier = function(identifier) {
      var alt, i, num, sum, _i, _ref;
      sum = 0;
      alt = false;
      for (i = _i = _ref = identifier.length - 1; _i >= 0; i = _i += -1) {
        num = parseInt(identifier.charAt(i), 10);
        if (isNaN(num)) {
          return false;
        }
        if (alt) {
          num *= 2;
          if (num > 9) {
            num = (num % 10) + 1;
          }
        }
        alt = !alt;
        sum += num;
      }
      return sum % 10 === 0;
    };

    return CreditCard;

  })();

  EspagoConnection = (function() {

    function EspagoConnection(public_key, endpoint) {
      this.public_key = public_key;
      this.endpoint = endpoint;
    }

    EspagoConnection.prototype.send = function(params, success_callback, error_callback) {
      var xhReq,
        _this = this;
      xhReq = this.create_xhr();
      xhReq.open("POST", this.endpoint, true);
      xhReq.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      xhReq.setRequestHeader("Content-Type", "application/json");
      xhReq.setRequestHeader("Authorization", this.basic_auth());
      xhReq.send(params);
      return xhReq.onloadend = function(data) {
        if (data.target.status === 201) {
          return success_callback(data);
        } else {
          return error_callback(data);
        }
      };
    };

    EspagoConnection.prototype.basic_auth = function() {
      return "Basic " + (Base64.encode(this.public_key));
    };

    EspagoConnection.prototype.create_xhr = function() {
      try {
        return new window.XMLHttpRequest();
      } catch (_error) {}
    };

    return EspagoConnection;

  })();

  Espago = (function() {

    function Espago(options) {
      var key, value;
      if (options == null) {
        options = {};
      }
      this.validate_last_name = __bind(this.validate_last_name, this);

      this.validate_first_name = __bind(this.validate_first_name, this);

      this.validate_card_date = __bind(this.validate_card_date, this);

      this.validate_card_cvc = __bind(this.validate_card_cvc, this);

      this.validate_card_number = __bind(this.validate_card_number, this);

      this.validate_credit_card = __bind(this.validate_credit_card, this);

      this.get_credit_card = __bind(this.get_credit_card, this);

      this.successful_response = __bind(this.successful_response, this);

      this.params = __bind(this.params, this);

      this.get_espago_enviroment = __bind(this.get_espago_enviroment, this);

      this.create_token = __bind(this.create_token, this);

      this.form_submit_listener = __bind(this.form_submit_listener, this);

      this.settings = {
        form: "#espago_form",
        card_number: "#espago_card_number",
        first_name: "#espago_first_name",
        last_name: "#espago_last_name",
        month: "#espago_month",
        year: "#espago_year",
        cvc: "#espago_verification_value",
        success: this.successful_response,
        error: this.error_response,
        submit: true,
        live: true,
        custom: false
      };
      for (key in options) {
        value = options[key];
        this.settings[key] = value;
      }
      this.public_key = this.settings.public_key;
      this.on_submit_callback = this.settings.on_submit;
      if (!this.settings.custom) {
        this.form_submit_listener();
      }
    }

    Espago.prototype.form_submit_listener = function() {
      var submit,
        _this = this;
      submit = document.querySelector("" + this.settings.form + " input[type=submit]");
      return submit.onclick = function(e) {
        if (document.getElementById('espagoCard') === null) {
          e.preventDefault();
          return _this.create_token();
        }
      };
    };

    Espago.prototype.create_token = function(options) {
      var connection, key, value;
      if (options == null) {
        options = {};
      }
      for (key in options) {
        value = options[key];
        this.settings[key] = value;
      }
      if (this.validate_credit_card()) {
        connection = new EspagoConnection(this.public_key, this.get_espago_enviroment());
        return connection.send(this.params(), this.settings.success, this.settings.error);
      }
    };

    Espago.prototype.get_espago_enviroment = function() {
      if (!this.settings.live) {
        return "https://sandbox.espago.com/api/tokens";
      }
      return "https://secure.espago.com/api/tokens";
    };

    Espago.prototype.params = function() {
      var obj;
      obj = {
        card: {}
      };
      obj.card.number = this.settings.card_number.element_value().remove_white_spaces();
      obj.card.first_name = this.settings.first_name.element_value();
      obj.card.last_name = this.settings.last_name.element_value();
      obj.card.month = this.settings.month.element_value();
      obj.card.year = this.settings.year.element_value();
      obj.card.verification_value = this.settings.cvc.element_value();
      return JSON.stringify(obj);
    };

    Espago.prototype.successful_response = function(data) {
      var input, parent_element;
      data = JSON.parse(data.target.responseText);
      input = document.createElement("input");
      input.type = 'hidden';
      input.value = data.id;
      input.id = 'espagoCard';
      input.name = 'card_token';
      parent_element = document.querySelector(this.settings.form);
      if (document.getElementById("espagoCard") === null) {
        parent_element.appendChild(input);
      } else {
        document.getElementById("espagoCard").value = data.id;
      }
      if (this.settings.submit) {
        return document.forms[this.settings.form.replace('#', '')].submit();
      }
    };

    Espago.prototype.error_response = function(data) {
      switch (data.target.status) {
        case 502:
          return alert("We are sorry but Espago service is currently offline");
        case 503:
          return alert("We are sorry but Espago service is currently offline");
        case 401:
          return alert("Unsuccessful authentication please check your public key");
        case 0:
          return alert("Unsuccessful authentication please check your public key");
        case 422:
          return alert("Bad data send");
      }
    };

    Espago.prototype.get_credit_card = function() {
      return new CreditCard({
        number: this.settings.card_number.element_value(),
        cvc: this.settings.cvc.element_value(),
        month: this.settings.month.element_value(),
        year: this.settings.year.element_value(),
        first_name: this.settings.first_name.element_value(),
        last_name: this.settings.last_name.element_value()
      });
    };

    Espago.prototype.validate_credit_card = function() {
      var card;
      card = this.get_credit_card();
      return card.validate();
    };

    Espago.prototype.validate_card_number = function() {
      var card;
      card = this.get_credit_card();
      return card.validate_card_number();
    };

    Espago.prototype.validate_card_cvc = function() {
      var card;
      card = this.get_credit_card();
      return card.validate_cvc();
    };

    Espago.prototype.validate_card_date = function() {
      var card;
      card = this.get_credit_card();
      return card.validate_date();
    };

    Espago.prototype.validate_first_name = function() {
      var card;
      card = this.get_credit_card();
      return card.validate_first_name();
    };

    Espago.prototype.validate_last_name = function() {
      var card;
      card = this.get_credit_card();
      return card.validate_last_name();
    };

    Espago.validate_card_number = function(number) {
      var card;
      card = new CreditCard({
        number: number
      });
      return card.validate_card_number();
    };

    Espago.validate_card_cvc = function(cvc) {
      var card;
      card = new CreditCard({
        cvc: cvc
      });
      return card.validate_cvc();
    };

    Espago.validate_card_date = function(month, year) {
      var card;
      card = new CreditCard({
        month: month,
        year: year
      });
      return card.validate_date();
    };

    Espago.validate_first_name = function(name) {
      var card;
      card = new CreditCard({
        first_name: name
      });
      return card.validate_first_name();
    };

    Espago.validate_last_name = function(name) {
      var card;
      card = new CreditCard({
        last_name: name
      });
      return card.validate_last_name();
    };

    return Espago;

  })();

  root.Espago = Espago;

}).call(this);