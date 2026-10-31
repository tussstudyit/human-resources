"""Create synthetic, text-based PDFs for the Golang recruitment test cases."""
from pathlib import Path
import argparse
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

parser=argparse.ArgumentParser()
parser.add_argument('--output-dir',required=True)
args=parser.parse_args()
out=Path(args.output_dir);out.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('CV',font+'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('CV-Bold',font+'DejaVuSans-Bold.ttf'))
styles={
 'name':ParagraphStyle('name',fontName='CV-Bold',fontSize=23,leading=29,textColor=HexColor('#142D4E'),spaceAfter=7),
 'role':ParagraphStyle('role',fontName='CV-Bold',fontSize=11,leading=16,textColor=HexColor('#0B6C79'),spaceAfter=8),
 'contact':ParagraphStyle('contact',fontName='CV',fontSize=9,leading=14,textColor=HexColor('#43546A'),spaceAfter=8),
 'notice':ParagraphStyle('notice',fontName='CV',fontSize=8,leading=12,textColor=HexColor('#64748B'),spaceAfter=14),
 'section':ParagraphStyle('section',fontName='CV-Bold',fontSize=10,leading=15,textColor=HexColor('#0B6C79'),spaceBefore=12,spaceAfter=6),
 'body':ParagraphStyle('body',fontName='CV',fontSize=9.3,leading=15,textColor=HexColor('#25354A'),spaceAfter=6),
}
cases=[
 ('01_CV_Golang_Phu_hop_cao.pdf','TEST 01 | Minh An Tran','Senior Golang Backend Engineer',[
 ('PROFILE',['Backend engineer focused on payment services, distributed systems and measurable delivery outcomes.']),
 ('TECHNICAL SKILLS',['Golang; Microservices; PostgreSQL; Redis; Kafka; gRPC; Docker; Unit Testing.']),
 ('EXPERIENCE',['Sandbox Payments Lab — simulated engineering role.','Employment period: 2021-01 to 2026-09.','Implemented Golang microservices with PostgreSQL and Redis, integrated Kafka messaging and gRPC APIs, packaged services with Docker, and practiced Unit Testing.']),
 ('PROJECT & DELIVERY',['Developed a reconciliation platform that reduced manual processing time by 60%. Designed idempotent transaction APIs and documented failure recovery.']),
 ('PRODUCTION & RELIABILITY',['Deployed production services on Kubernetes and optimized throughput to 2500 requests per second; reduced p95 latency to 80 ms. Implemented dashboards and incident runbooks.']),
 ('ENGINEERING QUALITY',['Implemented unit tests, integration tests and CI/CD security checks; increased automated test coverage to 92%. Performed code review and documented release procedures.']),
 ('EDUCATION',['BSc in Software Engineering — simulated education record, 2016-09 to 2020-06.']),
 ]),
 ('02_CV_Golang_Phu_hop_trung_binh.pdf','TEST 02 | Bao Nguyen','Golang Backend Developer',[
 ('PROFILE',['Application developer with experience implementing business APIs in a small team.']),
 ('TECHNICAL SKILLS',['Golang; PostgreSQL; Docker; Unit Testing.']),
 ('EXPERIENCE',['Sandbox Order Studio — simulated developer role.','Employment period: 2023-03 to 2026-06.','Implemented Golang REST APIs and PostgreSQL queries for order management. Packaged the application with Docker.']),
 ('PROJECT WORK',['Developed an order management application and implemented paginated REST APIs, input validation and role-based access checks.']),
 ('PRODUCTION EXPOSURE',['Production exposure: application dashboard observation and incident reporting to the operations team.']),
 ('ENGINEERING QUALITY',['Implemented unit tests for service logic and reviewed code changes through pull requests. Used Git for source control and documented API behavior.']),
 ('EDUCATION',['BSc in Information Technology — simulated education record, 2018-09 to 2022-06.']),
 ]),
 ('03_CV_Golang_Phu_hop_thap.pdf','TEST 03 | Linh Pham','Junior Web Content Designer',[
 ('PROFILE',['Entry-level web content and visual design profile focused on static pages and marketing materials.']),
 ('TECHNICAL SKILLS',['HTML; CSS; Figma; Canva; WordPress; Microsoft Excel.']),
 ('EXPERIENCE',['Sandbox Creative Studio — simulated design internship.','Employment period: 2025-06 to 2026-09.','Prepared static page layouts, image assets and weekly content schedules. Updated page content in a visual editor.']),
 ('PORTFOLIO',['Personal portfolio: three static landing pages, product illustrations and social media templates. A visual sitemap and color guide accompany the portfolio.']),
 ('WORKING PRACTICES',['Organized design feedback in shared documents and maintained a checklist for visual consistency.']),
 ('EDUCATION',['Diploma in Digital Design — simulated education record, 2023-09 to 2025-05.']),
 ]),
]
def decorate(c,doc):
 c.setStrokeColor(HexColor('#0B6C79'));c.setLineWidth(3);c.line(44,810,551,810)
 c.setFont('CV',7);c.setFillColor(HexColor('#64748B'))
 c.drawString(44,28,'SYNTHETIC TEST PROFILE • doanthanhhuy1309@gmail.com')
 c.drawRightString(551,28,str(doc.page))

for filename,name,role,sections in cases:
 story=[Paragraph(escape(name),styles['name']),Paragraph(escape(role),styles['role']),
  Paragraph('doanthanhhuy1309@gmail.com | Vietnam',styles['contact']),
  Paragraph('Synthetic profile for recruitment integration testing. All employment, education and project details below are fictional.',styles['notice'])]
 for title,paragraphs in sections:
  story.append(KeepTogether([Paragraph(escape(title),styles['section']),Paragraph(escape(paragraphs[0]),styles['body'])]))
  story.extend(Paragraph(escape(text),styles['body']) for text in paragraphs[1:])
 SimpleDocTemplate(str(out/filename),pagesize=A4,leftMargin=44,rightMargin=44,topMargin=48,bottomMargin=43,title=role+' — '+name,author='UpCareer Test Fixtures').build(story,onFirstPage=decorate,onLaterPages=decorate)
 print(out/filename)
