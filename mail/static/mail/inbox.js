document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //POST Email
  document.querySelector('#compose-form').addEventListener('submit', function(){
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body,
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });  
    load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3 id="onMailbox">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show the emails on the mailbox
  retrieve_emails(mailbox);
}

function retrieve_emails(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(add_email);
  });
}

function add_email(contents){
  const email = document.createElement('div');
  email.className = 'email';

  const info = document.createElement('div');
  const timestamp = document.createElement('div');
  const subject = document.createElement('div');
  const archive = document.createElement('button');

  archive.className = 'btn btn-dark';
  archive.innerHTML = 'Archive';
  archive.style.margin = '5px';

  const user = document.getElementById('user-email').innerHTML;

  if (user === contents.sender) {
    info.innerHTML = `To: ${contents.recipients}`;
    archive.style.display = 'none';
  } else {
    info.innerHTML = `From: ${contents.sender}`;
  
    if (contents.read) {
      email.style.background = 'rgb(220, 220, 220)';
    }

  }
  
  timestamp.innerHTML = `${contents.timestamp}`;
  subject.innerHTML = `Subject: (${contents.subject})`;
  
  email.append(info);
  email.append(document.createElement('hr'));
  email.append(subject);
  email.append(timestamp);

  if (!contents.archived) {
    archive.innerHTML = 'Archive';
    email.append(archive);
  } else {
    archive.innerHTML = 'Unarchive';
    email.append(archive);
  }

  email.addEventListener('click', () => {
    
    fetch(`/emails/${contents.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true,
      })
    });
    
    retrieve_email(contents.id);
    load_email();
    console.log(contents.id);

  })

  archive.addEventListener('click', () => {
    let archived = false;

    if (!contents.archived) {
      archived = true;
    } 
    
    fetch(`/emails/${contents.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived : archived,
      })
    });
  })

  document.querySelector('#emails-view').append(email);
}

function load_email(){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  //funcion responder aquí (creo)
}

function retrieve_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    const user = document.getElementById('user-email').innerHTML;

    if (user === email.sender) {
      document.getElementById('info').innerHTML = `<strong>Sent to: </strong> ${email.recipients}`;
      document.getElementById('button-div').style.display = 'none';
    } else {
      document.getElementById('info').innerHTML = `<strong>From: </strong> ${email.sender}`;
      document.getElementById('button-div').style.display = 'flex';
    }

    document.getElementById('subject').innerHTML = `<strong>Subject: </strong>${email.subject}`;
    document.getElementById('body').innerHTML = `${email.body}`;
    document.getElementById('timestamp').innerHTML = `<strong>${email.timestamp}</strong>`;
  });
}