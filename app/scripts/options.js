'use strict';

// Saves options to chrome.storage
function save_options() {
  var status = document.getElementById('status');
  status.textContent = '';
  var token = document.getElementById('input-token').value;
  localStorage["token"] = token;
  status.textContent = 'Options saved.';
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  if(localStorage["token"] != null) {
    document.getElementById('input-token').value = localStorage["token"];
  }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
