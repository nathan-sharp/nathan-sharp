// top nav

function createTopNav() {
  const topnav = document.createElement('div');
  topnav.className = 'topnav';
  topnav.id = 'myTopnav';

  const logo = document.createElement('a');
  logo.className = 'nav-logo';
  logo.href = '/';
  logo.textContent = 'NJSharp';
  topnav.appendChild(logo);

  const links = [
      { href: '/about/', text: 'About' },
      { href: 'https://apps.njsharp.uk/', text: 'Applications' },
      { href: 'https://publications.njsharp.uk/', text: 'Publications' }
  ];

  links.forEach(linkData => {
      const link = document.createElement('a');
      link.href = linkData.href;
      link.textContent = linkData.text;
      topnav.appendChild(link);
  });

  const iconLink = document.createElement('a');
  iconLink.href = 'javascript:void(0);';
  iconLink.className = 'icon';
  iconLink.onclick = myFunction;

  const icon = document.createElement('i');
  icon.className = 'fa fa-bars';
  iconLink.appendChild(icon);

  topnav.appendChild(iconLink);

  // Insert the topnav as the first child of the body
  document.body.insertBefore(topnav, document.body.firstChild);
}

/* Toggle between adding and removing the "responsive" class to topnav when the user clicks on the icon */
function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
}
