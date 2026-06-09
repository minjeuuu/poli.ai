#!/usr/bin/env python3
import smtplib
import ssl
import getpass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Define target recipients (115 organizations)
RECIPIENTS = [
    # --- IVY LEAGUE & TOP US DEPARTMENTS ---
    {"org": "Harvard University (Department of Government)", "email": "government@wjh.harvard.edu", "city": "Cambridge, Massachusetts, USA"},
    {"org": "Harvard Kennedy School (Belfer Center)", "email": "belfer_center@hks.harvard.edu", "city": "Cambridge, Massachusetts, USA"},
    {"org": "Stanford University (Political Science)", "email": "politicalscience@stanford.edu", "city": "Stanford, California, USA"},
    {"org": "MIT (Department of Political Science)", "email": "polisci@mit.edu", "city": "Cambridge, Massachusetts, USA"},
    {"org": "Princeton University (Department of Politics)", "email": "politics@princeton.edu", "city": "Princeton, New Jersey, USA"},
    {"org": "Yale University (Department of Political Science)", "email": "political.science@yale.edu", "city": "New Haven, Connecticut, USA"},
    {"org": "Columbia University (Political Science)", "email": "polisci@columbia.edu", "city": "New York, New York, USA"},
    {"org": "University of Chicago (Political Science)", "email": "political-science@uchicago.edu", "city": "Chicago, Illinois, USA"},
    {"org": "University of Pennsylvania (Political Science)", "email": "polisci@sas.upenn.edu", "city": "Philadelphia, Pennsylvania, USA"},
    {"org": "Cornell University (Department of Government)", "email": "government@cornell.edu", "city": "Ithaca, New York, USA"},
    {"org": "Dartmouth College (Department of Government)", "email": "government.department@dartmouth.edu", "city": "Hanover, New Hampshire, USA"},
    {"org": "Brown University (Political Science)", "email": "political_science@brown.edu", "city": "Providence, Rhode Island, USA"},
    {"org": "UC Berkeley (Political Science)", "email": "ps-staff@berkeley.edu", "city": "Berkeley, California, USA"},
    {"org": "UCLA (Political Science)", "email": "polisci@polisci.ucla.edu", "city": "Los Angeles, California, USA"},
    {"org": "University of Michigan (Political Science)", "email": "polisci@umich.edu", "city": "Ann Arbor, Michigan, USA"},
    {"org": "Duke University (Political Science)", "email": "politicalscience@duke.edu", "city": "Durham, North Carolina, USA"},
    {"org": "Johns Hopkins University (Political Science)", "email": "polisci@jhu.edu", "city": "Baltimore, Maryland, USA"},
    {"org": "Georgetown University (Department of Government)", "email": "government@georgetown.edu", "city": "Washington, D.C., USA"},
    {"org": "Northwestern University (Political Science)", "email": "political-science@northwestern.edu", "city": "Evanston, Illinois, USA"},
    {"org": "NYU (Department of Politics)", "email": "politics@nyu.edu", "city": "New York, New York, USA"},
    {"org": "Vanderbilt University (Political Science)", "email": "political.science@vanderbilt.edu", "city": "Nashville, Tennessee, USA"},
    {"org": "University of Virginia (Politics)", "email": "politics@virginia.edu", "city": "Charlottesville, Virginia, USA"},
    {"org": "Emory University (Political Science)", "email": "polisci@emory.edu", "city": "Atlanta, Georgia, USA"},
    {"org": "Washington University in St. Louis", "email": "polisci@wustl.edu", "city": "St. Louis, Missouri, USA"},
    {"org": "Carnegie Mellon University", "email": "sds@andrew.cmu.edu", "city": "Pittsburgh, Pennsylvania, USA"},
    {"org": "Tufts University (Political Science)", "email": "politicalscience@tufts.edu", "city": "Medford, Massachusetts, USA"},
    {"org": "Boston University (Political Science)", "email": "polisci@bu.edu", "city": "Boston, Massachusetts, USA"},
    {"org": "George Washington University (PSC)", "email": "psc@gwu.edu", "city": "Washington, D.C., USA"},
    {"org": "American University (School of Public Affairs)", "email": "spa@american.edu", "city": "Washington, D.C., USA"},
    {"org": "Syracuse University (Maxwell School)", "email": "maxwell@syracuse.edu", "city": "Syracuse, New York, USA"},

    # --- TOP EUROPEAN & UK DEPARTMENTS ---
    {"org": "Oxford University (DPIR)", "email": "enquiries@politics.ox.ac.uk", "city": "Oxford, Oxfordshire, United Kingdom"},
    {"org": "Cambridge University (POLIS)", "email": "enquiries@polis.cam.ac.uk", "city": "Cambridge, Cambridgeshire, United Kingdom"},
    {"org": "London School of Economics (LSE)", "email": "gov.enquiries@lse.ac.uk", "city": "London, United Kingdom"},
    {"org": "University College London (UCL)", "email": "political.science@ucl.ac.uk", "city": "London, United Kingdom"},
    {"org": "King's College London (DPE)", "email": "dpe@kcl.ac.uk", "city": "London, United Kingdom"},
    {"org": "University of Edinburgh (PIR)", "email": "pir.enquiries@ed.ac.uk", "city": "Edinburgh, Scotland, United Kingdom"},
    {"org": "Sciences Po Paris", "email": "contact@sciencespo.fr", "city": "Paris, France"},
    {"org": "Hertie School (Berlin)", "email": "info@hertie-school.org", "city": "Berlin, Germany"},
    {"org": "Graduate Institute Geneva (IHEID)", "email": "info@graduateinstitute.ch", "city": "Geneva, Switzerland"},
    {"org": "ETH Zurich (Center for Comparative Studies)", "email": "cis@gess.ethz.ch", "city": "Zurich, Switzerland"},
    {"org": "Leiden University (Political Science)", "email": "polsci@fsw.leidenuniv.nl", "city": "Leiden, Netherlands"},
    {"org": "University of Amsterdam (Political Science)", "email": "polsci@uva.nl", "city": "Amsterdam, Netherlands"},
    {"org": "Copenhagen University (Department of Political Science)", "email": "polsci@ifs.ku.dk", "city": "Copenhagen, Denmark"},
    {"org": "Stockholm University (Political Science)", "email": "info@statsvet.su.se", "city": "Stockholm, Sweden"},
    {"org": "Trinity College Dublin", "email": "politics@tcd.ie", "city": "Dublin, Ireland"},
    {"org": "University of Oslo", "email": "admin@stv.uio.no", "city": "Oslo, Norway"},
    {"org": "LMU Munich (Geschwister-Scholl-Institute)", "email": "gsi@gsi.uni-muenchen.de", "city": "Munich, Germany"},
    {"org": "Heidelberg University", "email": "info@ipw.uni-heidelberg.de", "city": "Heidelberg, Germany"},
    {"org": "EUI Florence", "email": "sps.enquiries@eui.eu", "city": "Florence, Italy"},

    # --- TOP ASIA-PACIFIC & CANADIAN DEPARTMENTS ---
    {"org": "University of Toronto (Political Science)", "email": "polsci.info@utoronto.ca", "city": "Toronto, Ontario, Canada"},
    {"org": "McGill University (Political Science)", "email": "politicalscience.arts@mcgill.ca", "city": "Montreal, Quebec, Canada"},
    {"org": "UBC Vancouver (Political Science)", "email": "politics.dept@ubc.ca", "city": "Vancouver, British Columbia, Canada"},
    {"org": "University of Melbourne (SSPS)", "email": "ssps-enquiries@unimelb.edu.au", "city": "Melbourne, Victoria, Australia"},
    {"org": "Australian National University (ANU)", "email": "bell.school@anu.edu.au", "city": "Canberra, ACT, Australia"},
    {"org": "University of Sydney (SSPS)", "email": "ssps.enquiries@sydney.edu.au", "city": "Sydney, New South Wales, Australia"},
    {"org": "National University of Singapore (NUS)", "email": "polbox1@nus.edu.sg", "city": "Singapore"},
    {"org": "Nanyang Technological University (NTU)", "email": "hss-polisci@ntu.edu.sg", "city": "Singapore"},
    {"org": "University of Tokyo (Graduate School of Law & Politics)", "email": "office@j.u-tokyo.ac.jp", "city": "Tokyo, Japan"},
    {"org": "Kyoto University", "email": "kyomu@law.kyoto-u.ac.jp", "city": "Kyoto, Japan"},
    {"org": "Seoul National University", "email": "politics@snu.ac.kr", "city": "Seoul, South Korea"},
    {"org": "Yonsei University", "email": "politics@yonsei.ac.kr", "city": "Seoul, South Korea"},
    {"org": "Tsinghua University (International Relations)", "email": "iis@tsinghua.edu.cn", "city": "Beijing, China"},
    {"org": "Peking University (School of Government)", "email": "sg@pku.edu.cn", "city": "Beijing, China"},
    {"org": "Fudan University (SIRPA)", "email": "sirpa@fudan.edu.cn", "city": "Shanghai, China"},
    {"org": "University of Hong Kong (PPA)", "email": "ppa@hku.hk", "city": "Hong Kong"},

    # --- PUBLIC POLICY THINK TANKS ---
    {"org": "Brookings Institution", "email": "communications@brookings.edu", "city": "Washington, D.C., USA"},
    {"org": "RAND Corporation", "email": "randinquiries@rand.org", "city": "Santa Monica, California, USA"},
    {"org": "Center for Strategic and International Studies (CSIS)", "email": "externalrelations@csis.org", "city": "Washington, D.C., USA"},
    {"org": "Council on Foreign Relations (CFR)", "email": "communications@cfr.org", "city": "New York, New York, USA"},
    {"org": "Carnegie Endowment for International Peace", "email": "info@ceip.org", "city": "Washington, D.C., USA"},
    {"org": "Chatham House (RIIA)", "email": "contact@chathamhouse.org", "city": "London, United Kingdom"},
    {"org": "American Enterprise Institute (AEI)", "email": "info@aei.org", "city": "Washington, D.C., USA"},
    {"org": "Heritage Foundation", "email": "info@heritage.org", "city": "Washington, D.C., USA"},
    {"org": "Cato Institute", "email": "info@cato.org", "city": "Washington, D.C., USA"},
    {"org": "Center for American Progress (CAP)", "email": "progress@americanprogress.org", "city": "Washington, D.C., USA"},
    {"org": "Hudson Institute", "email": "info@hudson.org", "city": "Washington, D.C., USA"},
    {"org": "Peterson Institute (PIIE)", "email": "communications@piie.com", "city": "Washington, D.C., USA"},
    {"org": "International Institute for Strategic Studies (IISS)", "email": "iiss@iiss.org", "city": "London, United Kingdom"},
    {"org": "Stockholm International Peace Research Institute (SIPRI)", "email": "sipri@sipri.org", "city": "Stockholm, Sweden"},
    {"org": "German Marshall Fund (GMF)", "email": "info@gmfus.org", "city": "Washington, D.C., USA"},
    {"org": "Atlantic Council", "email": "info@atlanticcouncil.org", "city": "Washington, D.C., USA"},
    {"org": "Woodrow Wilson Center", "email": "info@wilsoncenter.org", "city": "Washington, D.C., USA"},
    {"org": "Center for New American Security (CNAS)", "email": "info@cnas.org", "city": "Washington, D.C., USA"},
    {"org": "Urban Institute", "email": "externalaffairs@urban.org", "city": "Washington, D.C., USA"},

    # --- CORPORATE AI, POLICY & DEFENSE LABS ---
    {"org": "Google Research", "email": "research-inquiries@google.com", "city": "Mountain View, California, USA"},
    {"org": "Microsoft Research (Social Sciences)", "email": "msr-inquire@microsoft.com", "city": "Redmond, Washington, USA"},
    {"org": "Anthropic (Policy & Society)", "email": "inquiries@anthropic.com", "city": "San Francisco, California, USA"},
    {"org": "OpenAI (Policy Research)", "email": "contact@openai.com", "city": "San Francisco, California, USA"},
    {"org": "Palantir Technologies (Defense & Policy)", "email": "info@palantir.com", "city": "Denver, Colorado, USA"},
    {"org": "IBM Research (Social Computing)", "email": "ibmres@us.ibm.com", "city": "Yorktown Heights, New York, USA"},
    {"org": "Meta AI (Policy & Research)", "email": "press@meta.com", "city": "Menlo Park, California, USA"},
    {"org": "Apple AI (Siri & Policy Research)", "email": "media.help@apple.com", "city": "Cupertino, California, USA"},
    {"org": "Civic Technologies Lab", "email": "info@civictech.org", "city": "New York, New York, USA"},
    {"org": "GovTech Singapore", "email": "info@tech.gov.sg", "city": "Singapore"},
    {"org": "Palantir Government Division", "email": "government@palantir.com", "city": "Washington, D.C., USA"},
    {"org": "Defense Advanced Research Projects Agency (DARPA)", "email": "publicrelations@darpa.mil", "city": "Arlington, Virginia, USA"},
]

EMAIL_TEMPLATE_SUBJECT = "Formal Proposal: Intellectual Property Acquisition & Site Licensing - POLI Geopolitical Simulation & Research Suite"

HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>POLI Acquisition Proposal</title>
  <style>
    body {{
      background-color: #FAF8F5;
      font-family: Georgia, 'Times New Roman', Times, serif;
      color: #1C1917;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      background-color: #FAF8F5;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 650px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #E5E2D9;
      border-radius: 4px;
      padding: 48px;
      box-shadow: 0 4px 12px rgba(27, 26, 24, 0.03);
    }}
    .header {{
      border-bottom: 2px solid #E5E2D9;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }}
    .app-title {{
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      color: #1A1917;
      margin: 0;
      text-transform: uppercase;
    }}
    .app-subtitle {{
      font-size: 11px;
      color: #78716C;
      margin: 4px 0 0 0;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }}
    .recipient-block {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #78716C;
      margin-bottom: 36px;
      line-height: 1.6;
      border-left: 2px solid #D6D3D1;
      padding-left: 12px;
    }}
    p {{
      font-size: 16px;
      line-height: 1.75;
      margin: 0 0 20px 0;
      text-align: justify;
    }}
    .feature-list {{
      margin: 36px 0;
      padding: 0;
    }}
    .feature-item {{
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #E5E2D9;
    }}
    .feature-item:last-child {{
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }}
    .feature-title {{
      font-weight: bold;
      font-size: 17px;
      color: #7C2D12;
      margin-bottom: 6px;
    }}
    .feature-desc {{
      font-size: 15px;
      color: #44403C;
      line-height: 1.65;
      margin: 0;
      text-align: justify;
    }}
    .cta-section {{
      text-align: center;
      margin: 40px 0;
    }}
    .btn {{
      display: inline-block;
      background-color: #7C2D12;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 14px 30px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 2px;
    }}
    .btn:hover {{
      background-color: #9A3412;
    }}
    .footer {{
      border-top: 1px solid #E5E2D9;
      margin-top: 40px;
      padding-top: 24px;
      font-size: 14px;
      line-height: 1.6;
      color: #78716C;
    }}
    .footer-name {{
      font-weight: bold;
      font-size: 16px;
      color: #1C1917;
    }}
  </style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <div class="app-title">POLI</div>
      <div class="app-subtitle">Geopolitical Simulation &amp; Scholar Workspace</div>
    </div>
    
    <div class="recipient-block">
      <strong>FORMAL PROPOSAL TO:</strong><br>
      {formatted_recipient_org}<br>
      {recipient_city}<br><br>
      <strong>DATE:</strong> June 10, 2026<br>
      <strong>SUBJECT:</strong> Academic Intellectual Property Acquisition &amp; Site Licensing
    </div>

    <p>Dear Members of the Department,</p>

    <p>My name is Matthew Cesar Corpuz. I am an independent software developer and Political Science student based in Baguio City. I am writing to formally present a proposal for the acquisition or site-licensing of POLI (<a href="https://github.com/minjeuuu/POLI" style="color: #7C2D12; text-decoration: underline;">https://github.com/minjeuuu/POLI</a>), a high-density client-side workspace designed for geopolitical simulation, cabinet-building, and academic research curation.</p>

    <p>POLI represents a novel synthesis of political science theory and client-side engineering. I designed the platform to bridge the gap between empirical comparative politics models and structured research workflows. To eliminate the high database and infrastructure overhead typical of digital workspaces, the entire application operates client-side, resulting in zero server maintenance and scaling costs.</p>

    <p>While I am highly motivated to continue directing the development of POLI, as a student I lack the institutional funding and infrastructure required to host and scale the platform. Consequently, I am offering POLI for complete intellectual property acquisition. The purchaser will receive 100% ownership of the codebase, custom relational database engines, statebuilder simulator rulesets, and all associated legal rights.</p>

    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-title">1. Client-Side Relational Database Engine (PADE)</div>
        <div class="feature-desc">An emulated SQL query engine running over IndexedDB on the client browser. Features a redundant in-memory fallback state machine ensuring zero-crash boots and zero backend database overhead.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">2. The POLIverse Simulation Engine</div>
        <div class="feature-desc">An equation-driven cabinet statebuilder that models governmental appointments, calculating Cabinet Cohesion, Structural Integrity, and Ideological Alignment using structural political science formulas rather than simple heuristics.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">3. Scholar Reader &amp; Multi-Format Citation Subsystem</div>
        <div class="feature-desc">A justified reader layout optimized for research sessions. Includes print stylesheet media queries for dossier exports and a bibliographic compiler supporting over 50 regional academic formats (APSA, Chicago, Bluebook, IEEE, BibTeX, and Harvard).</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">4. Pre-Loaded Relational Taxonomies</div>
        <div class="feature-desc">In-depth schemas and data representations covering 15+ specialized geopolitical domains, including state agencies, national elections, judicial cases, treaties, political parties, and social movements.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">5. High-Density Scholarly UI</div>
        <div class="feature-desc">A custom, warm off-white (book-like) design system engineered for maximum data density, comparative government matrices, and focused scholarly reading.</div>
      </div>
    </div>

    <p>A comprehensive visual catalog documenting all 17 tabs and detail screens—including comparative indicator matrices, active simulation models, and the citation reader—can be reviewed alongside the complete codebase directly on the repository:</p>

    <div class="cta-section">
      <a href="https://github.com/minjeuuu/POLI" class="btn">View Project &amp; Visuals on GitHub</a>
    </div>

    <p><strong>Acquisition &amp; Licensing Terms:</strong><br>
    We value the outright acquisition of POLI and all associated intellectual property at $850,000 USD. Alternatively, we are open to institution-wide site licensing agreements starting at $85,000 USD per annum. I am fully committed to providing 60 days of direct technical transition support and comprehensive documentation to ensure a seamless integration with your existing research or simulation systems.</p>

    <p>Thank you for your time and consideration of this proposal. If this aligns with your department's technological or research goals, I would welcome the opportunity to schedule a brief technical walkthrough.</p>

    <div class="footer">
      <span class="footer-name">Matthew Cesar Corpuz</span><br>
      Political Science Student<br>
      Baguio City, Philippines<br>
      <a href="mailto:corpuzmatthew0814@gmail.com" style="color: #7C2D12; text-decoration: none;">corpuzmatthew0814@gmail.com</a>
    </div>
  </div>
</div>
</body>
</html>
"""

def format_org_name(org):
    # Formats orgs like "Harvard University (Department of Government)" to split lines
    if "(" in org:
        parts = org.split("(")
        dept = parts[1].replace(")", "").strip()
        univ = parts[0].strip()
        return f"{dept}<br>{univ}"
    return org

def main():
    print("=== POLI Acquisition Proposal Email Auto-Sender ===")
    print(f"Loaded {len(RECIPIENTS)} prestigious recipient organizations.")
    print("----------------------------------------------------------------")
    
    # Auto-filled defaults for Matthew's Google/Gmail account
    default_smtp = "smtp.gmail.com"
    default_port = 465
    default_email = "corpuzmatthew0814@gmail.com"
    
    print(f"Default Sender Profile:")
    print(f"  SMTP Server: {default_smtp}")
    print(f"  SMTP Port:   {default_port} (SSL)")
    print(f"  Gmail User:  {default_email}")
    print("----------------------------------------------------------------")
    
    use_defaults = input("Use default Gmail SMTP settings? (y/n, default=y): ").strip().lower()
    if use_defaults == 'n':
        smtp_server = input("SMTP Server (e.g. smtp.gmail.com): ").strip()
        try:
            smtp_port = int(input("SMTP Port (e.g. 465 for SSL, 587 for TLS): ").strip())
        except ValueError:
            print("Invalid port number.")
            return
        sender_email = input("Sender Email: ").strip()
    else:
        smtp_server = default_smtp
        smtp_port = default_port
        sender_email = default_email

    sender_name = "Matthew Cesar Corpuz"
    print(f"\nPlease enter the Google App Password for {sender_email}.")
    print("Note: To send emails using a Google account, you must use a 'Google App Password'")
    print("generated from your Google Account Security Settings under 2-Step Verification.")
    password = getpass.getpass("Password / App Password: ")
    
    if not password:
        print("Password cannot be empty.")
        return
        
    print("\nEstablishing secure connection to SMTP server...")
    context = ssl.create_default_context()
    
    try:
        if smtp_port == 465:
            server = smtplib.SMTP_SSL(smtp_server, smtp_port, context=context)
        else:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls(context=context)
            
        server.login(sender_email, password)
        print("✓ Connected and authenticated successfully.\n")
    except Exception as e:
        print(f"\nFailed to connect/authenticate: {e}")
        print("Please check your email address, port, server, and verify your App Password is correct.")
        return
        
    print("Starting dispatch sequence...")
    sent_count = 0
    for idx, recipient in enumerate(RECIPIENTS, 1):
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{sender_name} <{sender_email}>"
            msg["To"] = recipient["email"]
            msg["Subject"] = EMAIL_TEMPLATE_SUBJECT
            
            # Format organization name and city details professionally in HTML
            formatted_org = format_org_name(recipient["org"])
            city = recipient["city"]
            
            # Form html content
            html_content = HTML_TEMPLATE.format(
                formatted_recipient_org=formatted_org,
                recipient_city=city
            )
            
            msg.attach(MIMEText(html_content, "html"))
            
            server.sendmail(sender_email, recipient["email"], msg.as_string())
            print(f"[{idx}/{len(RECIPIENTS)}] ✓ Sent to {recipient['org']} ({recipient['email']})")
            sent_count += 1
        except Exception as err:
            print(f"[{idx}/{len(RECIPIENTS)}] ✗ Failed sending to {recipient['org']}: {err}")
            
    server.quit()
    print("----------------------------------------------------------------")
    print(f"Dispatch completed. Sent {sent_count}/{len(RECIPIENTS)} HTML emails successfully.")
    print("----------------------------------------------------------------")

if __name__ == "__main__":
    main()
