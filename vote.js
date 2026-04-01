// Json is used for storing the data in local storage, so that date can be retained
let users = JSON.parse(localStorage.getItem('users')) || []; 
let polls = JSON.parse(localStorage.getItem('polls')) || [];
let currentUser = null;

function save() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('polls', JSON.stringify(polls));
}
// Only way to get admin access is to use non capitalized password as the pass is "admin"
// Any othe password will just create normal account
function signup() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  if (!u || !p) return alert('Fill all fields');

  // Verify password if its "admin" 
  const role = (p === 'admin') ? 'admin' : 'user';

  if (users.find(x => x.username === u)) {
    return alert('User already exists');
  }

  users.push({ username: u, password: p, role: role });
  save();

  alert(role === 'admin' ? 'Admin created!' : 'User created!');
}

function login() {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;

  const user = users.find(x => x.username === u && x.password === p);
  if (!user) return alert('Invalid login');

  currentUser = user;

  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  document.getElementById('welcome').innerText =
    `Hello ${user.username} (${user.role})`;

  if (user.role === 'admin') {
    document.getElementById('adminPanel').classList.remove('hidden');
  }

  renderPolls();
}

function logout() {
  currentUser = null;
  location.reload();
}

// Creates / fills the poll with 2 options + stores votes
function createPoll() {
  const q = document.getElementById('question').value;
  const opt1 = document.getElementById('opt1').value;
  const opt2 = document.getElementById('opt2').value;
// Ensures that the poll question are being filled up
  if (!q || !opt1 || !opt2) return alert('Fill all');
// Saves the vote poll
  polls.push({
    id: Date.now(),
    question: q,
    options: [
      { text: opt1, votes: 0 },
      { text: opt2, votes: 0 }
    ],
    voters: []
  });

  save();
  renderPolls();
}
 // Every users got 1 vote (can only vote once)
function vote(pollId, index) {
  const poll = polls.find(p => p.id === pollId);

  if (!poll.voters) poll.voters = [];

  const alreadyVoted = poll.voters.find(v => v.username === currentUser.username);
  if (alreadyVoted) {
    return alert('You can only vote once!');
  }

  poll.options[index].votes++;

  // Optimises users name and vote index, shows which option user has voted for
  poll.voters.push({
    username: currentUser.username,
    optionIndex: index
  });

  save();
  renderPolls();
}
// After vote, users can unvote 
function unvote(pollId) {
  const poll = polls.find(p => p.id === pollId);

  if (!poll.voters) return alert('No votes yet');

  const voteIndex = poll.voters.findIndex(v => v.username === currentUser.username);

  if (voteIndex === -1) {
    return alert('You have not voted');
  }
// Checks which option user voted for
  const userVote = poll.voters[voteIndex];

  if (poll.options[userVote.optionIndex].votes > 0) {
    poll.options[userVote.optionIndex].votes--;
  }

  poll.voters.splice(voteIndex, 1);

  save();
  renderPolls();
}
// Only for admin
function deletePoll(id) {
  polls = polls.filter(p => p.id !== id);
  save();
  renderPolls();
}


function renderPolls() {
  const container = document.getElementById('polls');
  container.innerHTML = '';

  polls.forEach(p => {
    const div = document.createElement('div');
    div.className = 'poll';

    if (!p.voters) p.voters = [];
// Makes sure that the users can only vote once based on their username
    const userVote = p.voters.find(v => v.username === currentUser.username);

    const title = document.createElement('b');
    title.innerText = p.question;
    div.appendChild(title);

    div.appendChild(document.createElement('br'));

    p.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.innerText = `${opt.text} (${opt.votes})`;

      if (userVote) btn.disabled = true;

      btn.onclick = () => vote(p.id, i);
      div.appendChild(btn);
    });
// Only shows up when a user has made a vote, so that they can change the vote if change they mind
    if (userVote) {
      const unvoteBtn = document.createElement('button');
      unvoteBtn.innerText = 'Unvote';
      unvoteBtn.onclick = () => unvote(p.id);
      div.appendChild(unvoteBtn);
    }
// Delete button only visible to an admin
    if (currentUser.role === 'admin') {
      const delBtn = document.createElement('button');
      delBtn.innerText = 'Delete';
      delBtn.style.background = 'red';
      delBtn.onclick = () => deletePoll(p.id);
      div.appendChild(delBtn);
    }

    container.appendChild(div);
  });
}
