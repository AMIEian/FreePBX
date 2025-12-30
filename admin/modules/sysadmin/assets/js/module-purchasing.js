var ShmzFPBX;

ShmzFPBX = {};

ShmzFPBX = (function(api) {
  var activateRms, addItem, auth, buildUrl, cart, checkLicense, checkValidation, checkout, clearItems, createAccount, displayCart, nextStep, removeItem, setError, uniqueid, updateCart, updateItem, updateTotal;
  buildUrl = function(uri) {
    return "" + api + uri;
  };
  uniqueid = function() {
    var d0, d1, d2, d3, i, ls, lut, _i, _j;
    if (typeof Storage === "undefined") {
      throw "No localstorage";
    }
    ls = localStorage.getItem("katana-unique");
    if (ls !== null) {
      console.log("Found localstorage", ls);
      return ls;
    }
    lut = [];
    for (i = _i = 0; _i <= 16; i = ++_i) {
      lut[i] = '0' + i.toString(16);
    }
    for (i = _j = 17; _j <= 256; i = ++_j) {
      lut[i] = i.toString(16);
    }
    d0 = (Math.random() * performance.now()) * 0xffffffff | 0;
    d1 = (Math.random() * performance.now()) * 0xffffffff | 0;
    d2 = (Math.random() * performance.now()) * 0xffffffff | 0;
    d3 = (Math.random() * performance.now()) * 0xffffffff | 0;
    ls = lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    localStorage.setItem("katana-unique", ls);
    return ls;
  };
  updateTotal = function(total) {
    return $('.shmzfpbx-table .total-amt').html(total);
  };
  updateCart = function(cart, action) {
    var bStyle, cartId, checkoutTotal, checkoutTotalButton, pObj, totalId;
    if (action == null) {
      action = "update";
    }
    console.log("in update cart with", cart);
    if (cart.cart !== void 0) {
      console.log("cart length is", cart.cart.length);
    }
    if (cart.cart === void 0 || cart.cart.length === 0) {
      if ($("#shmz_shopping_dialog").is(":visible")) {
        $("#shmz_shopping_dialog").dialog("close");
      }
      $("#shmzfpbx_total").remove();
      if ($("#shmz_checkout_dialog").is(":visible")) {
        $("#shmz_checkout_dialog").dialog("close");
      }
      console.log('removing checkout dialog');
      $('#shmz_checkout_dialog').dialog('destroy');
      $('#shmz_checkout_dialog').remove();
      console.log('removing shopping dialog');
      $('#shmz_shopping_dialog').dialog('destroy');
      $('#shmz_checkout_hidden').remove();
      return true;
    }
    checkoutTotal = cart.total.toFixed(2);
    totalId = $("#shmzfpbx_total");
    cartId = $("#shmz_checkout_dialog");
    bStyle = "background:grey; color: white; ";
    if ($("#fpbxsearch").length === 1) {
      bStyle = bStyle + " position: relative; z-index: 100; top: 1em; right: 1px";
      pObj = "#fpbxsearch>.twitter-typeahead";
    } else {
      pObj = "#user_logout";
    }
    checkoutTotalButton = "<i class=\"fa fa-shopping-cart\"></i> $" + checkoutTotal;
    if (totalId.length > 0) {
      totalId.html(checkoutTotalButton);
    } else {
      $(pObj).after("<a id='shmzfpbx_total' href='#' class='button-right pull-right btn' title='cart' style='" + bStyle + "'>" + checkoutTotalButton + "</a>");
    }
    if (cartId.length === 0) {
      console.log("added shmzfpbx_cart html");
      $('body').append("<div id=\"shmz_checkout_hidden\" style=\"display:none\"><div id=\"shmz_checkout_dialog\" data-item-count=\"" + cart.cart.length + "\">" + cart.html.full + "</div></div>");
    } else {
      $(".shmzfpbx-table").replaceWith(cart.html.cart);
      $("#shmz_shopping_dialog").html(cart.html.cart);
    }
    cartId.data("item-count", (cart.status ? cart.cart.length : 0));
    return updateTotal(checkoutTotal);
  };
  addItem = function(module, ptype) {
    var machineid, url, zendid;
    console.log("In addItem with ", module, "and ", ptype);
    url = buildUrl("/store/cart/" + uniqueid());

    if (fpbx.conf.modules.sysadmin.zendid != null) {
      zendid = fpbx.conf.modules.sysadmin.zendid;
      machineid = null;
    } else {
      machineid = fpbx.conf.modules.sysadmin.machineid;
      zendid = null;
    }
    
    return $.ajax(url, {
      type: "POST",
      data: {
        type: ptype,
        item_id: module,
        zendid: zendid,
        machineid: machineid
      },
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        return console.log("AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        updateCart(data);
        $(".clickedbutton").each((function(_this) {
          return function(i, btn) {
            return $(btn).html($(btn).data('origtext')).attr('disabled', false).removeClass('clickedbutton');
          };
        })(this));
        return displayCart();
      }
    });
  };
  updateItem = function(module, qty, lineid, updatekey) {
    var url;
    if (lineid == null) {
      lineid = '';
    }
    if (updatekey == null) {
      updatekey = '';
    }
    console.log("module with a qty update is " + module);
    url = buildUrl("/store/cart/" + uniqueid());
    return $.ajax(url, {
      type: "PUT",
      data: {
        item_id: module,
        qty: qty,
        line_id: lineid,
        updatekey: updatekey
      },
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        return console.log("AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        return updateCart(data);
      }
    });
  };
  removeItem = function(module) {
    var url;
    console.log("module is " + module);
    url = buildUrl("/store/cart/del/" + uniqueid());
    return $.ajax(url, {
      type: "POST",
      data: {
        item_id: module
      },
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        return console.log("AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        return updateCart(data, "remove");
      }
    });
  };
  clearItems = function() {
    var url;
    url = buildUrl("/store/cart/" + uniqueid());
    $.ajax(url, {
      type: "DELETE",
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        return console.log("AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        return updateCart(data);
      }
    });
  };
  cart = function() {
   var id = null;
    if ( fpbx.conf.modules.sysadmin.zendid != null) {
      return id = fpbx.conf.modules.sysadmin.zendid;
    } 
    if( fpbx.conf.modules.sysadmin.machineid != null){
      return id = fpbx.conf.modules.sysadmin.machineid;
    }
    var url;
    url = buildUrl("/store/cart/" + uniqueid() + "/" + encodeURIComponent(id));
    return $.ajax(url, {
      type: "GET",
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        return console.log("AJAX Error: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
        return updateCart(data);
      }
    });
  };
  displayCart = function() {
    var cartData, itemCount, w;
    if ($("#fpbxsearch").length === 1) {
      $(".additional-items", "#shmz_checkout_dialog").css("height", "140px");
    }
    cartData = $("#shmz_checkout_dialog");
    w = cartData[0].clientWidth + 5 / 2;
    itemCount = cartData.data("item-count");
    if (itemCount > 0) {
      return cartData.dialog({
        modal: true,
        resizeable: false,
        title: "Module Purchasing Checkout",
        minWidth: 550,
        overlay: {
          opacity: 0.7,
          background: "black"
        },
        buttons: {
          "Empty Cart": function() {
            return clearItems();
          },
          "Continue Shopping": function() {
            return $(this).dialog("close");
          },
          "Complete Checkout": function() {
            return checkout();
          }
        }
      });
    } else {
      return cartData.dialog({
        modal: true,
        minWidth: 550,
        overlay: {
          opacity: 0.7,
          background: "black"
        },
        buttons: {
          "Close": function() {
            return $(this).dialog("destroy");
          }
        }
      });
    }
  };
  activateRms = function(keycode) {
    return $.ajax({
      type: "GET",
      url: "ajax.php?module=rmsadmin&command=SetNodeKey&node_key=" + keycode,
      error: function(xhr, status, error) {
        alert("An error has occurred while trying to activate RMS, please go to the RMS module and try updating your configuring with the following key: " + keycode);
      },
      success: function(response, status) {
        history.pushState(null, null, '/config.php?display=rmsadmin');
      }
    });
  };
  checkLicense = function(type, deploymentName, email, productData) {
    var postvar;
    if (email == null) {
      email = void 0;
    }
    if (productData == null) {
      productData = void 0;
    }
    switch (type) {
      case "new":
        postvar = {
          register: "YES",
          unused_dep: "YES",
          "portal-acct": "YES",
          portal_email: email,
          deploymentid: deploymentName,
          action: "register_deployment"
        };
        break;
      case "existing":
        postvar = {
          action: "check_lic"
        };
    }
    console.log(postvar);
    if (typeof Activation === 'undefined') {
      $("body").append("<div id='shmzskin_invoice_notice' title='Order Processed Successfully' style='display:none;'><p>Your order has been processed successfully and you will receive an invoice to the account email. We will now attempt to refresh the page and update your system's license file</p></div>");
      $("#shmzskin_invoice_notice").dialog({
        resizable: false,
        modal: true,
        buttons: {
          OK: function() {
            $(this).dialog("destroy");
            $("#shmzskin_invoice_notice").remove();
          }
        }
      });
      $.ajax({
        type: "POST",
        url: "/admin/config.php?display=sysadmin&view=license&quietmode=1",
        data: postvar,
        error: function(xhr, status, error) {
          alert("An error has occurred while trying to update your license file, please go to the sysadmin module and try updating your license manually.");
        },
        success: function(response, status) {
          var data, err;
          if (typeof JSON !== "undefined" && typeof JSON.parse === "function") {
            try {
              data = JSON.parse(response);
              if (data.error && data.error !== "") {
                alert(data.error);
              }
            } catch (_error) {
              err = _error;
              if (status !== "success") {
                console.log("The following error was encountered:", err);
              }
            }
          }
          setTimeout("location.reload(true);", 5000);
          if (typeof productData !== "undefined") {
            activateRms(productData.rms.keycode);
          }
        }
      });
    } else {
      $("body").append("<div id='shmzskin_invoice_notice' title='Order Processed Successfully' style='display:none;'><p>Your order has been processed successfully and you will receive an invoice to the account email. Please wait, we are now updating your activation</p><p id='actstat'></p></div>");
      $("#shmzskin_invoice_notice").dialog({
        resizable: false,
        modal: true
      });
      Activation.callback = function() {
        if (typeof productData !== "undefined") {
          activateRms(productData.rms.keycode);
        }
      };
      Activation.updateLic(deploymentName);
    }
    return false;
  };
  checkout = function() {
    var loading, mheight, radioChecked, t, url;
    console.log("checking out and processing my cart selections");
    $("#shmz_checkout_dialog").dialog("close");
    if ($("#fpbxsearch").length === 1) {
      mheight = 200;
    } else {
      mheight = 100;
    }
    loading = $("#shmz_checkout_loading").dialog({
      title: "Loading...",
      resizable: false,
      modal: true,
      height: mheight,
      closeOnEscape: false,
      open: function(event, ui) {
        $(".ui-dialog-titlebar-close", $(this).parent()).hide();
      },
      close: function(e) {
        $(e.target).dialog("destroy").remove();
      }
    });
    radioChecked = $("input[name=existingCard]:checked");
    t = {};
    t.existingCard = radioChecked.val();
    t.deployment_id = fpbx.conf.modules.sysadmin.deployment_id;
    t.terms_conditions = $("#check_terms").is(":checked");
    if (t.existingCard === "Yes") {
      t.credit_card_id = $("input[name=selected_credit_card]:checked").val();
      t.credit_card_token = $("input[name=selected_credit_card]:checked").data('token');
    } else {
      t.cc_type = $("select[name=cc_type]").val();
      t.cc_number = $("input[name=cc_number]").val();
      t.cc_exp_month = $("input[name=cc_exp_month]").val();
      t.cc_exp_year = $("input[name=cc_exp_year]").val();
      t.cc_name = $("input[name=cc_name]").val();
      t.cc_cvc = $("input[name=cc_cvc]").val();
      if ($("input[name=save_card_checkbox]").is(":checked")) {
        t.save_card_checkbox = $("input[name=save_card_checkbox]").val();
      }
      t.card_address = $("input[name=card_address]").val();
      t.card_city = $("input[name=card_city]").val();
      t.cc_phone_number = $("input[name=cc_phone_number]").val();
      t.card_state = $("select[name=card_state]").val();
      t.card_zip = $("input[name=card_zip]").val();
      t.card_country = $("select[name=card_country]").val();
    }
    url = buildUrl("/store/checkout/" + uniqueid());
    return $.ajax(url, {
      type: "POST",
      dataType: "json",
      data: t,
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        console.log("AJAX Error: " + textStatus);
        return $("#shmz_checkout_loading").dialog("destroy");
      },
      success: function(data, textStatus, jqXHR) {
        var deploymentEmail, deploymentName, productData;
        $("#shmz_checkout_loading").dialog("destroy");
        if (data.scp.status) {
          $("#shmzfpbx_total").remove();
          $("#shmz_checkout_dialog").dialog("close");
          $('#shmz_checkout_dialog').remove();
          updateCart(data);
          $("body").append("<div id='shmzskin_invoice_notice' title='Order Processed Successfully' style='display:none;'><p>Your order has been processed successfully and you will receive an invoice to the account email.</p></div>");
          return $("#shmzskin_invoice_notice").dialog({
            resizable: false,
            modal: true,
            buttons: {
              OK: function() {
                $(this).dialog("destroy");
                $("#shmzskin_invoice_notice").remove();
                location.reload();
              }
            }
          });
        } else if (data.status) {
          $("#shmzfpbx_total").remove();
          $("#shmz_checkout_dialog").dialog("close");
          $('#shmz_checkout_dialog').remove();
          updateCart(data);
          deploymentName = (data.deployment.name !== undefined ? data.deployment.name : fpbx.conf.modules.sysadmin.deployment_id);
          deploymentEmail = (data.deployment.email !== undefined ? data.deployment.email : void 0);
          productData = void 0;
          if (typeof data !== "undefined" && data.rms.status) {
            productData = {
              rms: {
                status: true,
                keycode: data.rms.keycode
              }
            };
          }
          return checkLicense(data.deployment.status, deploymentName, data.deployment.email, productData);
        } else {
          return setError(data.message);
        }
      }
    });
  };
  setError = function(error) {
    var shmz_error;
    $("#shmz_checkout_dialog").dialog('open');
    shmz_error = $(".shmz_error");
    if (error == null) {
      error = void 0;
      shmz_error.html("");
      shmz_error.hide();
      return;
    }
    shmz_error.html(error);
    shmz_error.show();
  };
  auth = function() {
    var email, password, url;
    console.log("in auth");
    url = buildUrl('/store/login');
    email = $("#email");
    password = $("#passwordExisting");
    return $.ajax(url, {
      type: 'POST',
      data: {
        email: email.val(),
        password: password.val(),
        uniqueid: uniqueid()
      },
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        console.log("Login Error " + textStatus);
        return setError("<strong>Error!</strong> We were unable to authenticate you with the provided credentials. Please try again.");
      },
      success: function(data, textStatus, jqXHR) {
        var c, cardListHtml, i, input;
        console.log("Login Success " + data);
        if (!data.status) {
          setError("<strong>Error!</strong> We were unable to authenticate you with the provided credentials. Please try again.");
          return;
        }
        cart();
        setError();
        if (data.credit_cards !== void 0 && data.credit_cards.length > 0) {
          c = data.credit_cards;
          for (i in c) {
            input = "input_" + c[i].id;
            cardListHtml = '<tr class="grid-row card-marker" id="' + input + '"><td><input id="' + input + '" type="radio" name="selected_credit_card" value="' + c[i].id + '"';
            cardListHtml += 'data-token="' + c[i].token + '"';
            if (c[i]["default"] === "1") {
              cardListHtml += " checked";
            }
            cardListHtml += '></td><td><label for="' + input + '">' + c[i].name + '</label></td><td>' + c[i].type + '</td><td>' + c[i].expiration + '</td></tr>';
            $('.card-list').append(cardListHtml);
          }
        } else {
          $('#accountCheck').hide();
        }
        $("#shmz_checkout_dialog .payment").show();
        $("#shmz_checkout_dialog .account").hide();
        return $(".ui-dialog-buttonpane button:contains('Complete Checkout')").button("enable");
      }
    });
  };
  checkValidation = function(selector) {
    var field;
    console.log("Check validity of " + $(selector));
    if (!$(selector).length) {
      return true;
    }
    field = $(selector).get(0);
    if ($(selector).val() === "") {
      return false;
    }
    if (!field.checkValidity()) {
      return false;
    }
    return true;
  };
  nextStep = function() {
    var email, emailUsed, url;
    if (!checkValidation("#email")) {
      setError("<strong>Error!</strong> Please enter a valid email address.");
      return;
    } else {
      setError();
    }
    email = $("#email");
    console.log("in next step");
    if ($("#accountTypeExisting").is(":checked")) {
      if ($("#passwordExisting").val() === "") {
        setError("<strong>Error!</strong> Please enter a valid password.");
        false;
      } else {
        auth();
      }
    } else {
      url = buildUrl('/store/newuser/check');
      emailUsed = false;
      $.ajax(url, {
        type: 'POST',
        data: {
          email: email.val(),
          uniqueid: uniqueid()
        },
        error: function(jqXHR, textStatus, errorThrown) {
          jqXHR.suppresserrors = true;
          return console.log("Login Error " + textStatus);
        },
        success: function(data, textStatus, jqXHR) {
          console.log("Login Success " + data);
          if (data.status) {
            return setError("<strong>Error!</strong> You cannot use that e-mail address or it's already in use. Please check to ensure you do not already have an account using this e-mail address.");
          } else {
            $("#email-create").val(email.val());
            $("#shmz_checkout_dialog .account-create").show();
            return $("#shmz_checkout_dialog .account").hide();
          }
        }
      });
    }
    $("#shmz_checkout_dialog").dialog({
      position: "center"
    });
  };
  createAccount = function() {
    var ec, error, fieldset, fs, url;
    fieldset = {
      "#name-create": "Name",
      "#email-create": "Email",
      "#email-create-confirm": "Email Confirmation",
      "#password-create": "Password",
      "#password-create-confirm": "Password Confirmation",
      "#phone_number": "Phone Number",
      "#billing_address1": "Address 1",
      "#billing_city": "City",
      "#billing_zip": "Zip/Post Code",
      "#billing_country": "Country",
      "#billing_state": "State/Province/Territory"
    };
    setError();
    error = "<strong>Error!</strong>";
    ec = 0;
    for (fs in fieldset) {
      console.log(fs);
      if (!checkValidation(fs)) {
        error += fieldset[fs];
        ec += 1;
      }
    }
    console.log(error);
    console.log(ec);
    if (ec > 0) {
      setError(error);
      return false;
    }
    $('#shmz_checkout_loading').show();
    url = buildUrl("/store/newuser/");
    return $.ajax(url, {
      type: "POST",
      data: {
        name: $("#name-create").val(),
        email: $("#email-create").val(),
        email_confirm: $("#email-create-confirm").val(),
        password: $("#password-create").val(),
        password_confirm: $("#password-create-confirm").val(),
        phone: $("#phone_number").val(),
        billing_address: $("#billing_address1").val(),
        billing_address2: $("#billing_address2").val(),
        billing_city: $("#billing_city").val(),
        billing_zip: $("#billing_zip").val(),
        billing_country: $("#billing_country").val(),
        billing_state: $("#billing_state").val(),
        uniqueid: uniqueid()
      },
      error: function(jqXHR, textStatus, errorThrown) {
        jqXHR.suppresserrors = true;
        console.log("AJAX Error: " + textStatus);
        $('#shmz_checkout_loading').hide();
        return setError(jqXHR.responseJSON.message);
      },
      success: function(data, textStatus, jqXHR) {
        console.log("successfully created an account");
        setError();
        $('#accountCheck').hide();
        $('#shmz_checkout_loading').hide();
        $("#shmz_checkout_dialog .payment").show();
        $("#shmz_checkout_dialog .account-create").hide();
        $("#shmz_checkout_dialog").dialog({
          position: "center"
        });
        $('#card_address').val($('#billing_address1').val());
        $('#card_city').val($('#billing_city').val());
        $('#cc_phone_number').val($('#cc_phone_number').val());
        $('#card_zip').val($('#billing_zip').val());
        $('#card_state').val($('#billing_state').val());
        $('#card_country').val($('#billing_country').val());
        return $(".ui-dialog-buttonpane button:contains('Complete Checkout')").button("enable");
      }
    });
  };
  return {
    uniqueid: function() {
      return uniqueid();
    },
    addItem: function(module, ptype) {
      return addItem(module, ptype);
    },
    updateItem: function(module, qty, lineid, updatekey) {
      return updateItem(module, qty, lineid, updatekey);
    },
    removeItem: function(module) {
      return removeItem(module);
    },
    cart: function() {
      return cart();
    },
    displayCart: function() {
      return displayCart();
    },
    clearItems: function() {
      return clearItems();
    },
    nextStep: function() {
      return nextStep();
    },
    setError: function(msg) {
      return setError(msg);
    },
    createAccount: function() {
      return createAccount();
    }
  };
});

function freepbxModulePurchasing(katanaUrl) {
  var sfpbx;
  sfpbx = ShmzFPBX(katanaUrl);
  console.log(sfpbx);
  sfpbx.cart();
  $(document).on("change", ".shmzfpbx-renewal", function(e) {
    var hash, lineid, newid, newqty, obj, selected;
    obj = $(e.target);
    hash = obj.data('hash');
    lineid = obj.data('lineid');
    selected = obj.find("option:selected");
    newid = selected.data('itemid');
    newqty = selected.data('qty');
    console.log("Hi ", obj, hash, newid, newqty);
    return sfpbx.updateItem(newid, newqty, lineid, hash);
  });
  $(document).on("click", ".fpbx-buy", function(e) {
    $(this).data('origtext', $(this).html());
    $(this).html("Adding...").attr("disabled", true).addClass("clickedbutton");
    if ($(this).data("purchasetype") === "renew") {
      console.log("Renewing item", $(this).data("rawname"));
      sfpbx.addItem($(this).data("rawname"), "renew");
    } else if ($(this).data("purchasetype") === "support-credits-purchase") {
      console.log("Purchasing support credits", $(this).data("rawname"));
      sfpbx.addItem($(this).data("rawname"), "support-credits-purchase");
    } else {
      console.log("Purchasing item", $(this).data("rawname"));
      sfpbx.addItem($(this).data("rawname"), "purchase");
    }
    return false;
  });
  $(document).on("click", "#shmzfpbx_total", function(e) {
    console.log("showing cart");
    if (!$('#shmz_checkout_dialog').is(':visible')) {
      sfpbx.displayCart();
    }
    return false;
  });
  $(document).on("dialogopen", "#shmz_checkout_dialog", function(event, ui) {
    var buttonState;
    if ($(".payment").is(":visible")) {
      buttonState = "enable";
    } else {
      buttonState = "disable";
    }
    return $(".ui-dialog-buttonpane button:contains('Complete Checkout')").button(buttonState);
  });
  $(document).on("click", ".existingCard", function(e) {
    var n, radioChecked;
    radioChecked = $("input[name=existingCard]:checked");
    e = $("#card_table");
    n = $("#new_card");
    if (radioChecked.val() === "Yes") {
      n.hide();
      return e.show();
    } else {
      e.hide();
      return n.show();
    }
  });
  $(document).on("click", ".shmzfpbx-table .fa-times", function(e) {
    var item_id, items;
    item_id = $(this).data("item-id");
    items = $("#shmz_checkout_dialog").data("item-count");
    if (items === 1) {
      return sfpbx.removeItem(item_id);
    } else {
      return $(this).parents("tr").fadeOut("slow", function() {
        console.log("removing item");
        sfpbx.removeItem(item_id);
        return $(this).remove();
      });
    }
  });
  $(document).on("change", "#shmz_checkout_dialog .shmzfpbx-qty", function(e) {
    var module, qty;
    module = $(this).data("item-id");
    qty = $(this).val();
    return sfpbx.updateItem(module, qty);
  });
  $(document).on("click", "#nextStep", function(e) {
    console.log("next step click attempted");
    return sfpbx.nextStep();
  });
  $(document).on("click", "#resetCreate", function(e) {
    $("#shmz_checkout_dialog .account-create").hide();
    $("#shmz_checkout_dialog .account").show();
    $("#shmz_checkout_dialog").dialog({
      position: "center"
    });
  });
  $(document).on("change", "#accountTypeExisting", function(e) {
    if ($(this).is(":checked")) {
      $("#passwordExisting").prop("disabled", false);
    }
  });
  $(document).on("change", "#accountTypeNew", function(e) {
    if ($(this).is(":checked")) {
      $("#passwordExisting").prop("disabled", true);
    }
  });
  return $(document).on("click", "#submitCreate", function(e) {
    sfpbx.createAccount();
  });
}
