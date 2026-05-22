// javascript that creates multiple pages using javascript DOM.
document.addEventListener('DOMContentLoaded', () => {
  const PAGE = document.body.dataset.page;
  const JOBS_KEY = 'jp_jobs_v1';
  const APPS_KEY = 'jp_apps_v1';

  // helpers. 
  // It takes the input s if its empty or null it treats it as an empty stringvto prevent errors
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  //Get the specific parameter value by its key
  const getParam = (k) => new URLSearchParams(location.search).get(k);
  //It saves items to local storage in a as a string 
  const save = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  //Gets items from local storage
  const load = (k) => JSON.parse(localStorage.getItem(k) || 'null');
  // replaceAll('&','&amp;')It replaces every ampersand character(&), with &amp. 
  //replaceAll('<','&lt;')It replaces every less than sign with &lt.
  //replaceAll('>','&gt;')It replaces every greater than sign with &gt.
  const escapeHtml = s => String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

  // seed jobs if none
  function seedJobs(){
    let jobs = load(JOBS_KEY);
    if(!jobs){
      jobs = [
        {id:1,title:'Frontend Intern',company:'Buea Tech',location:'Buea',desc:'Assist building UI components for student portal.'},
        {id:2,title:'Junior Backend Dev',company:'StartupXYZ',location:'Buea',desc:'Work on Node.js services and data.'},
        {id:3,title:'Data Analyst (Graduate)',company:'Insight Hub',location:'Buea',desc:'Analyze student outcome datasets.'},
        {id:4,title:'Marketing Assistant',company:'SmallBiz Co',location:'Buea',desc:'Support social media and outreach.'},
        {id:5,title:'UX Designer (Trainee)',company:'DesignLab',location:'Buea',desc:'Help prototype simple job platform screens.'},
        {id:6,title:'Web Designer (Pro)',company:'DesignLab',location:'Buea',desc:'Help design wordpress or shopify simple websites.'}
      ];
      save(JOBS_KEY, jobs);
    }
    return load(JOBS_KEY);
  }

  // common: get jobs
  function getJobs(){ return load(JOBS_KEY) || seedJobs(); }

  // PAGE: listing the jobs to the find jobs page.
  if(PAGE === 'listings'){
    //go to getjobs, select from joblists and return no jobs if there is none.
    const jobs = getJobs();
    const $jobsList = qs('#jobsList');
    const $no = qs('#noJobs');

    if(!jobs.length){ $no.classList.remove('hidden'); } else {
      $no.classList.add('hidden');
      //for each job element, create a classname "job",create an innerHTML that carries a div container displaying each job element
      jobs.forEach(j => {
        const el = document.createElement('div');
        el.className = 'job';
        el.innerHTML = `
          <div>
            <h3 class="title">${escapeHtml(j.title)}</h3>
            <div class="company">${escapeHtml(j.company)} • ${escapeHtml(j.location||'')}</div>
            <div class="meta">${escapeHtml(String(j.desc).slice(0,120))}${(j.desc||'').length>120?'…':''}</div>
          </div>
          <div class="actions">
            <a class="btn" href="details.html?id=${encodeURIComponent(j.id)}">View</a>
          </div>
        `;
        $jobsList.appendChild(el);
      });
    }
  }

  // PAGE: details
  if(PAGE === 'details'){    
    const id = getParam('id');
    const jobs = getJobs();
    const job = jobs.find(x => String(x.id) === String(id));
    const $d = qs('#jobDetails');
    if(!job){ $d.innerHTML = '<p class="muted">Job not found.</p><p><a href="listings.html">Back to listings</a></p>'; return; }
    $d.innerHTML = `
      <h2>${escapeHtml(job.title)}</h2>
      <p><strong>${escapeHtml(job.company)}</strong> • ${escapeHtml(job.location||'')}</p>
      <p>${escapeHtml(job.desc)}</p>
      <div class="row">
        <a class="btn" href="apply.html?id=${encodeURIComponent(job.id)}">Apply Now</a>
        <a class="btn outline" href="listings.html">Back</a>
      </div>
    `;
  }

  // PAGE: apply (form validation)
  if(PAGE === 'apply'){
    //
    const id = getParam('id');
    const jobs = getJobs();
    const job = jobs.find(x => String(x.id) === String(id));
    const $applyFor = qs('#applyFor');
    const $form = qs('#applyForm');
    const $msg = qs('#applyMsg');
    const $back = qs('#backToDetails');
    if(!job){ $applyFor.textContent = 'Job not found'; $form.style.display='none'; return; }
    $applyFor.textContent = `Apply for: ${job.title} — ${job.company}`;
    $back.href = `details.html?id=${encodeURIComponent(job.id)}`;
    $form.addEventListener('submit', (e) => {
      e.preventDefault();
      $msg.textContent = '';
      const fd = new FormData($form);
      const name = (fd.get('name')||'').trim();
      const email = (fd.get('email')||'').trim();
      const phone = (fd.get('phone')||'').trim();
      if(!name || !email || !phone){ $msg.textContent = 'Please fill required fields.'; return; }
      if(!/^\S+@\S+\.\S+$/.test(email)){ $msg.textContent = 'Enter a valid email.'; return; }
      const cv = fd.get('cv');
      const cvName = cv && cv.name ? cv.name : '';
      const apps = load(APPS_KEY) || [];
      apps.push({ id: Date.now(), jobId: job.id, name, email, phone, cvName, appliedAt: new Date().toISOString() });
      save(APPS_KEY, apps);
      $msg.textContent = 'Application submitted — thank you!';
      $form.reset();
    });
  }

  // PAGE: post (employer posting)
  if(PAGE === 'post'){
    const $form = qs('#postJobForm');
    const $msg = qs('#postMsg');
    $form.addEventListener('submit', (e) => {
      e.preventDefault();
      $msg.textContent = '';
      const fd = new FormData($form);
      const company = (fd.get('company')||'').trim();
      const title = (fd.get('title')||'').trim();
      const location = (fd.get('location')||'').trim();
      const desc = (fd.get('desc')||'').trim();
      if(!company || !title || !location || !desc){ $msg.textContent = 'Please complete all fields.'; return; }
      const jobs = getJobs();
      const newJob = { id: Date.now(), company, title, location, desc };
      jobs.unshift(newJob);
      save(JOBS_KEY, jobs);
      $msg.textContent = 'Job posted successfully!';
      $form.reset();
      // small visual confirmation then redirect to listings
      setTimeout(() => { location.href = 'listings.html'; }, 900);
    });
  }
});