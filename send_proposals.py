#!/usr/bin/env python3
import smtplib
import ssl
import getpass
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load target recipients from contacts.json if it exists, otherwise fall back to a small default list
import json
import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONTACTS_PATH = os.path.join(SCRIPT_DIR, "contacts.json")

if os.path.exists(CONTACTS_PATH):
    try:
        with open(CONTACTS_PATH, "r") as f:
            RECIPIENTS = json.load(f)
    except Exception as e:
        print(f"Warning: Failed to load contacts.json ({e}). Using default list.")
        RECIPIENTS = []
else:
    RECIPIENTS = []

if not RECIPIENTS:
    RECIPIENTS = [
        {"org": "Google Research (Policy & Systems)", "email": "research-inquiries@google.com", "city": "Mountain View, California, USA"},
        {"org": "Google DeepMind (Inquiries)", "email": "deepmind-inquiries@google.com", "city": "London, United Kingdom"},
        {"org": "Google Corporate Development (Acquisitions)", "email": "corpdev@google.com", "city": "Mountain View, California, USA"},
        {"org": "OpenAI (Policy Research Division)", "email": "contact@openai.com", "city": "San Francisco, California, USA"},
        {"org": "Anthropic (Policy & Society Group)", "email": "inquiries@anthropic.com", "city": "San Francisco, California, USA"},
        {"org": "NVIDIA Research (AI & Systems)", "email": "info@nvidia.com", "city": "Santa Clara, California, USA"},
        {"org": "Hugging Face (Research & Policy)", "email": "contact@huggingface.co", "city": "New York, New York, USA"},
        {"org": "Scale AI (Federal & Defense Division)", "email": "info@scale.com", "city": "San Francisco, California, USA"},
        {"org": "Mistral AI (Research Division)", "email": "contact@mistral.ai", "city": "Paris, France"},
        {"org": "Cohere (AI Research & Platform)", "email": "info@cohere.com", "city": "Toronto, Ontario, Canada"},
        {"org": "Microsoft Research (Computational Social Sciences)", "email": "msr-inquire@microsoft.com", "city": "Redmond, Washington, USA"},
        {"org": "Amazon Science (AWS AI Research)", "email": "aws-inquiries@amazon.com", "city": "Seattle, Washington, USA"},
        {"org": "Meta AI (Research & Public Policy)", "email": "press@meta.com", "city": "Menlo Park, California, USA"},
        {"org": "Apple AI (Siri & Machine Learning)", "email": "media.help@apple.com", "city": "Cupertino, California, USA"},
        {"org": "IBM Research (Social Computing & Networks)", "email": "ibmres@us.ibm.com", "city": "Yorktown Heights, New York, USA"},
        {"org": "Palantir Technologies (Product & M&A)", "email": "info@palantir.com", "city": "Denver, Colorado, USA"},
        {"org": "Palantir Government Division", "email": "government@palantir.com", "city": "Washington, D.C., USA"},
        {"org": "Defense Advanced Research Projects Agency (DARPA)", "email": "publicrelations@darpa.mil", "city": "Arlington, Virginia, USA"},
        {"org": "GovTech Singapore", "email": "info@tech.gov.sg", "city": "Singapore"},
        {"org": "Civic Technologies Lab", "email": "info@civictech.org", "city": "New York, New York, USA"},
        {"org": "United Nations Secretariat (OICT)", "email": "oict@un.org", "city": "New York, New York, USA"},
        {"org": "United Nations University (UNU)", "email": "unu@unu.edu", "city": "Tokyo, Japan"},
        {"org": "World Bank (Development Economics Research)", "email": "research@worldbank.org", "city": "Washington, D.C., USA"},
        {"org": "International Monetary Fund (IMF Library)", "email": "library@imf.org", "city": "Washington, D.C., USA"},
        {"org": "OECD (Directorate for STI)", "email": "dsti.contact@oecd.org", "city": "Paris, France"}
    ]


EMAIL_TEMPLATE_SUBJECT = "Formal Proposal: Intellectual Property Acquisition & Site Licensing - POLI Political Science & Curation Workspace"

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
    .highlight-box {{
      background-color: #FAF8F5;
      border: 1px solid #E5E2D9;
      border-left: 3px solid #7C2D12;
      padding: 20px;
      margin: 28px 0;
    }}
    .highlight-title {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: bold;
      color: #7C2D12;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }}
    .highlight-desc {{
      font-size: 15px;
      line-height: 1.6;
      color: #1C1917;
      margin: 0;
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
      <div class="app-subtitle">Political Science &amp; Research Workspace</div>
    </div>
    
    <div class="recipient-block">
      <strong>FORMAL PROPOSAL TO:</strong><br>
      {formatted_recipient_org}<br>
      {recipient_city}<br><br>
      <strong>DATE:</strong> June 10, 2026<br>
      <strong>SUBJECT:</strong> Academic Intellectual Property Acquisition &amp; Site Licensing
    </div>

    <p>Dear Members of the Department,</p>

    <p>My name is Matthew Cesar Corpuz. I am an independent software developer and Political Science student based in Baguio City. I am writing to formally present an acquisition and licensing proposal for POLI (<a href="https://github.com/minjeuuu/POLI" style="color: #7C2D12; text-decoration: underline;">https://github.com/minjeuuu/POLI</a>)—a high-density, professional political science research, curation, and data simulation workspace that I single-handedly designed and engineered.</p>

    <p>POLI represents a novel synthesis of empirical political science taxonomies and client-side engineering. I designed and built this application to solve the fragmented workflow of comparative politics research and document compilation. To eliminate the high database, hosting, and server infrastructure overhead typical of digital workspaces, the entire application operates directly on the client's browser, resulting in zero server maintenance and scaling costs.</p>

    <p>While I am highly motivated to continue directing the development of POLI, I face critical resource and hosting limitations. As an independent student, my budget for this project is currently $0, meaning I have no active funding to maintain backend integrations, servers, and APIs. The estimated operational funds required to fully host and support the system are:</p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-family: Georgia, serif; font-size: 16px; line-height: 1.75; text-align: justify;">
      <li style="margin-bottom: 8px;"><strong>LLM API Keys (Gemini and Claude Services):</strong> Estimated at $150 to $300 per month for active research parsing, terminology translations, and study card generation.</li>
      <li style="margin-bottom: 8px;"><strong>Cloud Deployment &amp; Hosting:</strong> Estimated at $20 to $50 per month to maintain online production workspaces and development environments.</li>
      <li style="margin-bottom: 8px;"><strong>Database &amp; Sync Infrastructure:</strong> Estimated at $30 to $100 per month for multi-user document syncing and global relational dataset synchronization.</li>
    </ul>
    <p>Due to these ongoing operational constraints and my lack of personal funding, I am offering POLI for complete intellectual property acquisition or strategic licensing. As the purchaser, your organization will receive 100% ownership of the codebase, custom relational database engines, dataset taxonomies, and all associated legal rights, with the institutional capacity to fund and host these high-value features.</p>

    <div class="feature-list">
      <div class="feature-item">
        <div class="feature-title">1. Multilateral Comparative Matrix Engine</div>
        <div class="feature-desc">An interactive interface that allows researchers to compare national indicators, bureaucratic parameters, demographic indices, and political structures across multiple countries side-by-side.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">2. Chronological Almanac &amp; Historical Timeline Archive</div>
        <div class="feature-desc">A queryable global timeline documenting major treaties, political shifts, and historical profiles, filterable by date ranges, categories, and specific nations.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">3. Bilingual Scholarly Translation Terminal</div>
        <div class="feature-desc">A dedicated, side-by-side translation workspace with an integrated terminology glossary database to localize research papers and documentation.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">4. Dynamic Syllabus Parser &amp; Study Generator</div>
        <div class="feature-desc">Automatically ingests course syllabus structures, generating comprehensive study plans, conceptual reviews, and interactive study flashcards.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">5. Pre-Loaded Relational Taxonomies (15+ Specialized Domains)</div>
        <div class="feature-desc">Built-in schemas and dataset catalogs covering bureaucratic agencies, elections, landmark judicial cases, treaties, political parties, social movements, and university department research portfolios.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">6. Client-Side Relational Database Engine (PADE)</div>
        <div class="feature-desc">An emulated SQL query engine running over IndexedDB on the client browser. Features a redundant in-memory fallback state machine ensuring zero-crash boots and zero backend database overhead.</div>
      </div>
      <div class="feature-item">
        <div class="feature-title">7. Scholar Reader &amp; Multi-Format Citation Compiler</div>
        <div class="feature-desc">A justified reader layout optimized for research. Includes print stylesheets for instant dossier exports and a bibliographic compiler supporting over 50 regional academic formats (APSA, Chicago, Bluebook, IEEE, BibTeX, and Harvard).</div>
      </div>
    </div>

    <div class="highlight-box">
      <div class="highlight-title">Why POLI is a High-Value Asset for Your Institution</div>
      <div class="highlight-desc">
        <ul style="margin: 0; padding-left: 20px; font-family: Georgia, serif; font-size: 15px; line-height: 1.65; color: #1C1917;">
          <li style="margin-bottom: 8px;"><strong>Interactive Pedagogical Sandbox:</strong> POLI can be instantly deployed as a lab simulator in undergraduate or graduate coursework for comparative politics, public policy, or international relations.</li>
          <li style="margin-bottom: 8px;"><strong>Cost-Free Deployment:</strong> Because the application runs entirely client-side, your department can support thousands of concurrent students or researchers without incurring server or cloud database maintenance fees.</li>
          <li style="margin-bottom: 0;"><strong>Proprietary Research Tool:</strong> The underlying PADE relational structure allows your researchers to query, edit, and print custom geopolitical dossiers and bibliographies offline.</li>
        </ul>
      </div>
    </div>

    <p>A comprehensive visual catalog documenting all 17 tabs and detail screens—including comparative indicator matrices, active simulation models, and the citation reader—can be reviewed alongside the complete codebase directly on the repository:</p>

    <div class="cta-section">
      <a href="https://github.com/minjeuuu/POLI" class="btn">View Project &amp; Visuals on GitHub</a>
    </div>

    <p><strong>Acquisition &amp; Licensing Terms:</strong><br>
    I value the outright acquisition of POLI and all associated intellectual property at $850,000 USD. Alternatively, I am open to institution-wide site licensing agreements starting at $85,000 USD per annum. Upon purchase, complete ownership and all legal rights transfer entirely to your organization. The application is fully self-contained, client-side execution ready, and comes with comprehensive code documentation to ensure a clean, independent transition. For direct acquisition settlements or licensing payments, my Wise payment link is: <a href="https://wise.com/pay/me/matthewcesarcabaccangc" style="color: #7C2D12; text-decoration: underline;">https://wise.com/pay/me/matthewcesarcabaccangc</a></p>

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
        
    print("\n--- Target Recipient Selection ---")
    print(f"Total contacts loaded: {len(RECIPIENTS)}")
    print("Sending emails to 200+ recipients at once via a personal Gmail SMTP server")
    print("will likely trigger Google's anti-spam controls and terminate connection sockets.")
    print("It is highly recommended to dispatch in smaller batches (e.g., 20-30 at a time)")
    print("and use a time delay between emails.")
    
    start_idx = 1
    end_idx = len(RECIPIENTS)
    
    custom_range = input(f"Send to a specific range of contacts? (y/n, default=n): ").strip().lower()
    if custom_range == 'y':
        try:
            start_idx = int(input(f"Start index (1-{len(RECIPIENTS)}): ").strip())
            end_idx = int(input(f"End index ({start_idx}-{len(RECIPIENTS)}): ").strip())
            if start_idx < 1 or end_idx > len(RECIPIENTS) or start_idx > end_idx:
                raise ValueError
        except ValueError:
            print("Invalid range. Sending to all.")
            start_idx = 1
            end_idx = len(RECIPIENTS)
            
    try:
        delay_sec = float(input("Enter delay between emails in seconds (default=5): ").strip() or "5")
        if delay_sec < 0:
            delay_sec = 5.0
    except ValueError:
        delay_sec = 5.0

    targets_to_send = RECIPIENTS[start_idx-1:end_idx]
    total_targets = len(targets_to_send)
    print(f"\nPrepared to send to {total_targets} targets (indices {start_idx} to {end_idx}) with a {delay_sec}s delay between messages.")
    confirm = input("Confirm and proceed with dispatch? (y/n, default=y): ").strip().lower()
    if confirm == 'n':
        print("Dispatch cancelled.")
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
    for i, recipient in enumerate(targets_to_send, 1):
        global_idx = start_idx + i - 1
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
            print(f"[{i}/{total_targets}] (Global #{global_idx}) ✓ Sent to {recipient['org']} ({recipient['email']})")
            sent_count += 1
            
            # Sleep to prevent rate limit blocks / spam filters
            if i < total_targets and delay_sec > 0:
                time.sleep(delay_sec)
        except Exception as err:
            print(f"[{i}/{total_targets}] (Global #{global_idx}) ✗ Failed sending to {recipient['org']}: {err}")
            
    server.quit()
    print("----------------------------------------------------------------")
    print(f"Dispatch completed. Sent {sent_count}/{total_targets} HTML emails successfully.")
    print("----------------------------------------------------------------")

if __name__ == "__main__":
    main()
