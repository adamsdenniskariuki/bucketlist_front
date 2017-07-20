import { Component, AfterViewInit, OnInit } from '@angular/core';
import { BucketService, AuthService, ItemService } from '../../services/app.service'
import {Router} from '@angular/router';

declare var require: any;
declare var jQuery: any;
declare var Materialize: any;

@Component({
  selector: 'dash',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [BucketService, AuthService, ItemService]
})

export class DashboardComponent implements AfterViewInit, OnInit{
  
  loader = true;
  listBucketsLists = true;
  search = "";
  bucket: string;
  limit = 10;
  bucketResponse: bucketResponse;
  keys: string[];
  currentKey: number;
  bucketId: number;
  errorMessages: string;
  itemName: string;
  bucketName: string;
  bucketsHtml: string;
  userId: number;
  username: string;
  useremail: string;
  useroldpassword: string;
  userpassword: string;
  userconfirmpassword: string;
  itemNames: any[] = [];

  // initialize global variables
  constructor(private router: Router, private itemService: ItemService, private bucketService: BucketService, private authService: AuthService){}

  // after all components have been loaded execute jquery
  ngAfterViewInit(){
    jQuery(document).ready(function(){
      jQuery('.modal').modal();
      jQuery('#bucketName').keyup(function(e) {
        if(e.which == 13) {
            jQuery('#updatebucketlistmodal').modal('close');
        }
      });
      jQuery('#newItem').keyup(function(e) {
        if(e.which == 13) {
            jQuery('#newitemmodal').modal('close');
        }
      });
    });
  }

  // on page load authenticate user and get all buckets
  ngOnInit(){
    
    let login_status = localStorage.getItem('login_status');
    
    if(login_status != "1"){
      this.router.navigate(['/login']);
      return false;
    }else{
      this.getPaginatedBuckets(1);
      this.getUserDetails();
    }

  }

  // get user details 
  getUserDetails(){
    this.authService.authGetUser().subscribe(response => {

      if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
      }

      if(response.messages == 'user exists'){
        this.userId = response.id;
        this.username = response.name;
        this.useremail = response.email;
        
        jQuery(document).ready(function(){
          Materialize.updateTextFields();
        });

      }

    }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })
  }
  
  // edit user details
  editUser(){

    if(this.userconfirmpassword != this.userpassword){
      Materialize.toast(JSON.stringify("Passwords do not match"), 5000);
    }else{
        this.authService.authEditUser(
        this.userId,
        this.username,
        this.useremail,
        this.userpassword,
        this.useroldpassword).subscribe(response => {
          Materialize.toast(JSON.stringify(response.messages).replace(/[\]}"{[]/g, ''), 5000);
          if(JSON.stringify(response.messages).includes('Access Denied')){
            this.logOutUser()
          }
          return false
        }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })
    }
  }

  // log out user
  logOutUser(){
    //Materialize.toast("Your token has expired. Please log in again", 5000);
    localStorage.setItem('login_status', '0');
    localStorage.setItem('current_user', '');
    this.router.navigate(['/']);
  }

  // create new bucket
  newBucket(){
    this.bucketService.createBucket(this.bucket).subscribe(response => {
      
      if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
      }
      if(response.messages == "create_success"){
        this.bucketResponse.bucketlists.splice(0,0,response['bucketlists']);
        Materialize.toast("Bucket list " + this.bucket + " successfully created", 5000);
      }else{
        this.errorMessages = JSON.stringify(response.messages).replace(/['\]}"{[]/g, '')
        Materialize.toast(this.errorMessages, 5000);
      }
    }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })
  }

  // search for bucket list name or id
  searchBuckets(){
    if(typeof this.search === "undefined"){
      this.search = ""
    }
    this.loader = true;
    this.bucketService.searchBucket(this.search, this.limit).subscribe(
      response => {
        this.loader = false;
        if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
        }
        if(JSON.stringify(response.messages).includes("list_success")){
          this.bucketResponse = response;
          if(this.bucketResponse.bucketlists.length > 0){
            this.keys = Object.keys(this.bucketResponse.bucketlists)
          }else{
            Materialize.toast(this.search + " not found", 5000);
          }
          
        }else{
          Materialize.toast(JSON.stringify(response.messages).replace(/[\]}"_{[]/g, ' '), 5000);
        }
    },
    errors => {
      Materialize.toast("Error connecting to the database", 5000);
    })
  }

  // get all bucket lists
  getPaginatedBuckets(page){
    this.bucketService.getAllBuckets(page, this.limit, this.search).subscribe(response => {
      this.loader = false;
      if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
      }
      this.bucketResponse = response;
      if(this.bucketResponse.bucketlists){
        this.keys = Object.keys(this.bucketResponse.bucketlists)
        if(!this.bucketResponse.messages.includes("list_success")){
          Materialize.toast(this.bucketResponse.messages, 5000)
        }else{
          jQuery(document).ready(function(){
            Materialize.updateTextFields();
          });
        }
      }
    }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })
  }

  // set the bucket list id of the item to be created
  setId(key){
    this.currentKey = key
    this.bucketId = jQuery('#bucketId' + key).html();
    this.bucketName = this.bucketResponse.bucketlists[key].name;
  }

  // view bucket list name
  viewBucket(key){

    jQuery(document).ready(function(){
      Materialize.updateTextFields();
      jQuery('#updatebucketlistmodal-' + key).modal('open');
    });
  }

  // update bucket list name
  updateBucket(event, key, bucketName){

    this.bucketService.updateBucket(this.bucketId, bucketName).subscribe(response => {
      if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
      }
      if(JSON.stringify(response.messages).includes('already exists')){
          this.bucketResponse.bucketlists[key].name = this.bucketName;
      }
      Materialize.toast(
        JSON.stringify(response.messages).replace(/[\]'_}"{[]/g, ' '), 5000);
      jQuery('.modal').modal('close');
    }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    });
  }

  // delete bucket
  deleteBucket(key){
    this.bucketId = jQuery('#bucketId' + key).html();
    if(confirm('Are you sure you want to delete this bucket list? This action is irreversible.')){
      this.bucketService.deleteBucket(this.bucketId).subscribe(response => {
        if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
        }
      if(response.messages == "delete_single_success"){
        let index = this.bucketResponse.bucketlists.indexOf(this.bucketResponse.bucketlists[key])
        this.bucketResponse.bucketlists.splice(index, 1);
        this.keys = Object.keys(this.bucketResponse.bucketlists)
        Materialize.toast("Bucket list deleted successfully", 5000);
      }
      else{
        this.errorMessages = JSON.stringify(response.messages).replace(/[\]'_}"{[]/g, '')
        Materialize.toast(this.errorMessages, 5000);
        }
      }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })

    }
  }

  // create item
  createItem(){
    this.itemService.createItem(this.bucketId, this.itemName).subscribe(response => {
      if(JSON.stringify(this.bucketResponse.messages).includes('Access Denied')){
          this.logOutUser()
      }
      if(response.messages == "create_item_success"){
        this.bucketResponse.bucketlists[this.currentKey].items.splice(0,0,response.item)
        Materialize.toast("Item " + this.itemName + " successfully added", 5000);
        jQuery('.modal').modal('close');
      }else{
        this.errorMessages = JSON.stringify(response.messages).replace(/['\]}"{[]/g, '')
        Materialize.toast(this.errorMessages, 5000);
      }
    }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    })
  }

  // view bucket list items
  viewItems(key){

    jQuery(document).ready(function(){
      Materialize.updateTextFields();
      jQuery('#viewitemsmodal' + key).modal('open');
    });
  }

  // edit items
  updateItems(key, iId, editedField, editedValue, event){
    
    if(editedValue.length == 0){
      Materialize.toast("The name field cannot be empty", 5000);
      event.preventDefault()
    } 
    
    if(editedField == "done"){
      if(event.target.checked){
        editedValue = true;
      }else{
        editedValue = false;
      }
    }

    if(event.which == 13 || event.type == "click") {
      if(this.bucketResponse.bucketlists[key].items.length > 0){
        this.itemService.updateItem(this.bucketId, iId, editedField, editedValue).subscribe(response => {
          if(JSON.stringify(response.messages).includes('Access Denied')){
            this.logOutUser()
          }
          Materialize.toast(JSON.stringify(response.messages).replace(/[\]'_}"{[]/g, ' '), 5000);
        }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    });
      }
    }   
  }

  // delete items
  deleteItems(key, itemIndex, iId){
    if(confirm("Are you sure you want to delete this item? This action is irreversible.")){
      this.itemService.deleteItem(this.bucketId, iId).subscribe(response => {
        if(JSON.stringify(response.messages).includes('Access Denied')){
          this.logOutUser()
        }
        let index = this.bucketResponse.bucketlists[key].items.indexOf(this.bucketResponse.bucketlists[key].items[itemIndex])
        this.bucketResponse.bucketlists[key].items.splice(index, 1)
        if(JSON.stringify(response.messages).replace(/[\]_'}"{[]/g, '').includes('delete_item_success'))
        Materialize.toast("Item successfully deleted", 5000);
      }, errors => {
        Materialize.toast("Error connecting to the database", 5000);
    });
    }
    
  }

}

interface bucketResponse{
    messages;
    bucketlists;
    pagination;
}