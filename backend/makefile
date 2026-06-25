dev:
	uvicorn app.main:app --reload

seed:
	python reset_db.py

db:
	docker exec -it language_tutor_db psql -U postgres -d language_tutor

test:
	cd backend && python -m pytest