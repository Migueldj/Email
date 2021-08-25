document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.addEventListener('click', event => {
    const element = event.target;
    if (element.className === 'btn btn-dark') {
      element.parentElement.parentElement.remove();
      if (document.querySelector('#onMailbox').innerHTML === "Archive") {
        location.reload();
      }
    }
  })

  const form = document.getElementById('compose-form');
  // form.addEventListener('submit', () => {

  //     const recipients = document.querySelector('#compose-recipients').value;
  //     const subject = document.querySelector('#compose-subject').value;
  //     const body = document.querySelector('#compose-body').value;

  //     fetch('/emails', {
  //       method: 'POST',
  //       body: JSON.stringify({
  //           recipients: recipients,
  //           subject: subject,
  //           body: body,
  //       })
  //     })
  //     .then(response => response.json())
  //     .then(result => {
  //         console.log(result);
  //     });

  //     load_mailbox('sent');

  //     return false;

  // });

  form.onsubmit = () => {
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
          console.log(result);
          load_mailbox('sent'); // I moved this line here to show the submited email on the sent mailbox otherwise it wont be displayed, just the previous sent emails 
      });

      //load_mailbox('sent');

      return false;
  }

  const reply = document.getElementById('reply')
  reply.addEventListener('click', () => {
    const subject = document.querySelector('#subject').innerHTML;
    const body = document.querySelector('#body').innerHTML;
    const email = document.querySelector('#info').innerHTML;
    const timestamp = document.querySelector('#timestamp').innerHTML;
    data = {
      reply : true,
      email : email,
      subject : subject,
      message : body,
      timestamp : timestamp,
    };
    compose_email(data);
  })

  // By default, load the inbox
  load_mailbox('inbox');
  
});

function compose_email(data) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  const emailBox = document.querySelector('#compose-recipients');
  const subjectBox = document.querySelector('#compose-subject');
  const messageBox = document.querySelector('#compose-body')

  if (data.reply) {
    
    emailBox.value = data.email;

    let aux = '';
    for (let i = 0; i < 3; i++) {
      aux += data.subject.charAt(i);
    }
    if (aux == 'Re:' || aux == 're:') {
      subjectBox.value = data.subject;
    } else {
      subjectBox.value = `Re: ${data.subject}`;
    }

    messageBox.value = `On: ${data.timestamp}; ${data.email} wrote: ` + '\n' + data.message;

  } else {
  // Clear out composition fields
    emailBox.value = '';
    subjectBox.value = '';
    messageBox.value = '';
  }
  
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
  const subject = document.createElement('div');
  const div1 = document.createElement('div');

  const timestamp = document.createElement('span');
  const archive = document.createElement('button');
  const div2 = document.createElement('div');

  archive.className = 'btn btn-dark';
  archive.style.marginLeft = '10px';
  div1.className = 'alert alert-light';
  div2.className = 'div2';

  const user = document.getElementById('user-email').innerHTML;

  if (user === contents.sender) {
    info.innerHTML = `Sent to: ${contents.recipients}`;
    archive.style.display = 'none';
    div1.style.fontWeight = 'normal';
  } else {
    info.innerHTML = `From: ${contents.sender}`;
  
    if (contents.read) {
      div1.className = "alert alert-secondary";
    }

  }
  
  timestamp.innerHTML = `${contents.timestamp}`;
  subject.innerHTML = `Subject: (${contents.subject})`;
  
  div1.append(subject);
  div1.append(info);
  email.append(div1);
  div2.append(timestamp);

  if (!contents.archived) {
    archive.innerHTML = 'Archive';
    div2.append(archive);
  } else {
    archive.innerHTML = 'Unarchive';
    div2.append(archive);
  }

  email.append(div2);

  div1.addEventListener('click', () => {
    
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

}

function retrieve_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    const user = document.getElementById('user-email').innerHTML;

    if (user === email.sender) {
      document.getElementById('selection').innerHTML = `<strong>Sent to: </strong>`;
      document.getElementById('info').innerHTML = email.recipients;
      document.getElementById('button-div').style.display = 'none';
    } else {
      document.getElementById('selection').innerHTML = `<strong>From: </strong>`;
      document.getElementById('info').innerHTML = email.sender;
      document.getElementById('button-div').style.display = 'flex';
    }
    console.log(email.body);
    document.getElementById('subject').innerHTML = `${email.subject}`;
    document.getElementById('body').innerHTML = `${email.body}`;
    document.getElementById('timestamp').innerHTML = `${email.timestamp}`;
  });
}