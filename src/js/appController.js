/**
 * @license
 * Copyright (c) 2014, 2024, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define([
  "ojs/ojcontext",
  "ojs/ojresponsiveutils",
  "ojs/ojresponsiveknockoututils",
  "knockout",
  "ojs/ojknockout",
  "ojs/ojarraydataprovider",
  "ojs/ojasyncvalidator-regexp",
], function (
  Context,
  ResponsiveUtils,
  ResponsiveKnockoutUtils,
  ko,
  $,
  ArrayDataProvider,
  AsyncRegExpValidator
) {
  function ControllerViewModel() {
    // Media queries for responsive layouts
    const smQuery = ResponsiveUtils.getFrameworkQuery(
      ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY
    );
    this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

    // Header
    // Application Name used in Branding Area
    this.appName = ko.observable("User Api Demo");

    // Add User Section
    this.openDialog = ko.observable(false);
    this.closeDialog = () => {
      this.openDialog(false);
    };
    this.openDialogButton = () => {
      this.openDialog(true);
    };
    this.buttonOpenerClick = () => {
      this.openDialogButton();
      document.getElementById("addUserModalDialog").open();
    };
    this.submitAddUserButtonClick = () => {
      const userFormData = {
        name: this.userName(),
        email: this.userEmail(),
        age: this.userAge(),
      };

      if (
        !userFormData.name ||
        !userFormData.email ||
        !userFormData.age ||
        isNaN(userFormData.age)
      ) {
        alert("Please fill out all fields correctly.");
        return;
      }

      fetch("http://localhost:8080/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userFormData),
      })
        .then((response) => response.json())
        .then((data) => {
          this.tableUserData.push(data);
        })
        .catch((error) => {
          console.error("Error adding user:", error);
        });

      this.closeDialog();
      document.getElementById("addUserModalDialog").close();
    };

    // User Form
    this.userName = ko.observable("");
    this.userEmail = ko.observable("");
    this.userAge = ko.observable();
    this.emailPatternValidator = ko.observableArray([
      new AsyncRegExpValidator({
        pattern:
          "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
        hint: "Enter a valid email format",
        messageDetail: "Not a valid email format",
      }),
    ]);

    // Table
    this.tableUserData = ko.observableArray([]);
    fetch("http://localhost:8080/api/v1/users")
      .then((response) => response.json())
      .then((data) => {
        this.tableUserData(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
    this.dataProvider = new ArrayDataProvider(this.tableUserData, {
      keyAttributes: "id",
      implicitSort: [{ attribute: "id", direction: "ascending" }],
    });

    // Footer
    this.footerLinks = [
      {
        name: "About Oracle",
        linkId: "aboutOracle",
        linkTarget: "http://www.oracle.com/us/corporate/index.html#menu-about",
      },
      {
        name: "Contact Us",
        id: "contactUs",
        linkTarget: "http://www.oracle.com/us/corporate/contact/index.html",
      },
      {
        name: "Legal Notices",
        id: "legalNotices",
        linkTarget: "http://www.oracle.com/us/legal/index.html",
      },
      {
        name: "Terms Of Use",
        id: "termsOfUse",
        linkTarget: "http://www.oracle.com/us/legal/terms/index.html",
      },
      {
        name: "Your Privacy Rights",
        id: "yourPrivacyRights",
        linkTarget: "http://www.oracle.com/us/legal/privacy/index.html",
      },
    ];
  }

  // release the application bootstrap busy state
  Context.getPageContext().getBusyContext().applicationBootstrapComplete();

  return new ControllerViewModel();
});
