from abc import ABC, abstractmethod


class BaseTask(ABC):
    @abstractmethod
    def register(self):
        pass
    
    def __call__(self, *args, **kwargs):
        return self.register().delay(*args, **kwargs)